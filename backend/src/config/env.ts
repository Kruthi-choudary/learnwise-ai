// Centralised environment config. Call loadEnv() once at startup.
import { config } from "dotenv";

export function loadEnv() {
  config(); // loads .env if present (safe to call when .env doesn't exist)
}

export const env = {
  get port() {
    return Number(process.env["PORT"] ?? 3001);
  },
  get nodeEnv() {
    return process.env["NODE_ENV"] ?? "development";
  },
  get corsOrigin() {
    // TanStack Start / Vite dev server binds to 8080 by default.
    // Override via CORS_ORIGIN env var in production.
    return process.env["CORS_ORIGIN"] ?? "http://localhost:8080";
  },
  get jwtSecret() {
    return process.env["JWT_SECRET"] ?? "dev_secret_change_in_production";
  },
  get isDev() {
    return this.nodeEnv === "development";
  },
};
