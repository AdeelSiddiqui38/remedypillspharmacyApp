import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { securityHeaders, apiLimiter } from "./security";
import { serveStatic } from "./static";
import { createServer } from "http";
import { seedAdminUser } from "./seed-admin";
import { startRetentionSweepSchedule } from "./retention";
import { startKrollSweepSchedule } from "./kroll";
import fs from "fs";
import path from "path";

// Load environment variables from .env (local development) without extra dependencies.
// In production, set environment variables in your hosting provider dashboard.
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;

      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      val = val.replace(/^["']|["']$/g, "");

      // Only set if not already set (so real env vars win)
      if (!(key in process.env)) process.env[key] = val;
    }
  }
} catch {
  // ignore
}

const app = express();
const httpServer = createServer(app);

// Security headers (helmet) + global API rate limit.
app.use(securityHeaders);
app.use("/api", apiLimiter);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Request logging. Deliberately logs ONLY method/path/status/duration —
// never response bodies. This is a healthcare app: response payloads contain
// PHI (prescriptions, health logs, patient contact details) and must not be
// written to server logs.
app.use((req, res, next) => {
  const start = Date.now();
  const p = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (p.startsWith("/api")) {
      log(`${req.method} ${p} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  await registerRoutes(httpServer, app);
  await seedAdminUser();
  startRetentionSweepSchedule();
  startKrollSweepSchedule();

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // Setup Vite in development; serve static in production
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Port from env; default 3000 for local dev (5000 conflicts with macOS AirTunes)
  const port = parseInt(process.env.PORT || "3000", 10);

  // Bind host automatically:
  // • Local dev on Mac → 127.0.0.1 (avoids ENOTSUP)
  // • Production (Render/Linux) → 0.0.0.0 (required for Render port scan)
  const host =
    process.env.HOST ||
    (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");

  httpServer.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
})();