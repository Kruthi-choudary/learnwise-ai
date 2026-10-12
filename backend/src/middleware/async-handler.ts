import type { Request, Response, NextFunction, RequestHandler } from "express";

// Express 4 doesn't forward a rejected promise from an async handler to the
// error middleware on its own — wrap each async controller with this so a
// thrown/rejected error reaches errorHandler instead of crashing silently.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
