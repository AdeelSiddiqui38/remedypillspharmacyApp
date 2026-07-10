import helmet from "helmet";
import rateLimit from "express-rate-limit";

// ── Security headers ────────────────────────────────────────
// CSP is only enforced in production: the Vite dev server injects inline
// scripts that a strict CSP would break. Radix/shadcn set inline styles,
// so style-src needs 'unsafe-inline'.
const isProd = process.env.NODE_ENV === "production";

export const securityHeaders = helmet({
  contentSecurityPolicy: isProd
    ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      }
    : false,
  // The Capacitor WebView loads the app from its own origin; COEP breaks
  // nothing here, but keep cross-origin policies relaxed for the mobile shell.
  crossOriginEmbedderPolicy: false,
});

// ── Rate limiting ───────────────────────────────────────────
// Global ceiling for all API traffic per IP.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 400,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again shortly." },
});

// Strict limiter for credential endpoints (login, register, change-password).
// The per-account lockout in auth.ts protects a single account; this protects
// against credential-stuffing sweeps across many accounts from one IP.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many attempts. Please wait 15 minutes and try again." },
});

// Limiter for endpoints that trigger outbound email/SMS or accept
// unauthenticated input (transfer requests, contact webhook).
export const messagingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});
