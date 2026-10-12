import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      studentId?: string;
    }
  }
}

// Every student-scoped route requires an X-Student-Id header. The frontend
// generates one anonymous id per browser (localStorage) and sends it on
// every request — no login, just enough identity to keep two visitors'
// performance records from colliding in the shared backend.
export function requireStudentId(req: Request, res: Response, next: NextFunction) {
  const studentId = req.header("x-student-id");
  if (!studentId || !studentId.trim()) {
    res.status(400).json({ error: "Missing X-Student-Id header" });
    return;
  }
  req.studentId = studentId.trim();
  next();
}
