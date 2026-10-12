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
    return process.env["CORS_ORIGIN"] ?? "http://localhost:3000";
  },
  get jwtSecret() {
    return process.env["JWT_SECRET"] ?? "dev_secret_change_in_production";
  },
  get isDev() {
    return this.nodeEnv === "development";
  },
};
