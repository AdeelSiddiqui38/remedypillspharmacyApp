import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Force sslmode=no-verify regardless of what's in DATABASE_URL: newer
// postgres drivers treat sslmode=require/prefer/verify-ca as verify-full,
// which fails against managed Postgres hosts using a private CA (e.g.
// DigitalOcean). no-verify still encrypts the connection, just without
// validating the certificate chain.
const url = new URL(process.env.DATABASE_URL);
url.searchParams.set("sslmode", "no-verify");

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: url.toString(),
  },
});
