import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "../models/auth.model.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
      userRollNo?: string;
    }
  }
}

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
  rollNo: string;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "30d" });
}

// Every /api/me/* route requires a real signed-in account — the frontend's
// Demo mode never sends this header, it stays on the anonymous X-Student-Id
// flow (see student.middleware.ts) instead.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
    req.userId = payload.sub;
    req.userRole = payload.role;
    req.userRollNo = payload.rollNo;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
