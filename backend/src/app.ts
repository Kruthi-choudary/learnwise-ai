import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import academicsRouter from "./routes/academics.routes.js";
import studentRouter from "./routes/student.routes.js";
import authRouter from "./routes/auth.routes.js";
import userContentRouter from "./routes/user-content.routes.js";

export function createApp() {
  const app = express();

  // ── Global middleware ────────────────────────────────────────────────────
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  if (env.isDev) app.use(requestLogger);

  // ── Health check ─────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", env: env.nodeEnv, timestamp: new Date().toISOString() });
  });

  // ── API routes ────────────────────────────────────────────────────────────
  app.use("/api/academics", academicsRouter);
  app.use("/api",           studentRouter);
  app.use("/api/auth",      authRouter);
  app.use("/api/me",        userContentRouter);

  // ── Error handling (must come last) ──────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
