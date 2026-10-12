import type { Request, Response, NextFunction } from "express";

// Simple request logger — replace with a proper logger (pino/winston) in production.
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
}
