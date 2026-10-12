import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";

// Centralised error handler — must have 4 params so Express recognises it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req: Request, res: Response, _next: NextFunction) => {
  const status: number = (err as { status?: number }).status ?? 500;
  const message: string = err instanceof Error ? err.message : "Internal server error";
  console.error(err);
  res.status(status).json({ error: message });
};

// 404 handler for unmatched routes.
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}
