import type { Request, Response } from "express";
import { z } from "zod";
import {
  createUser,
  findUserByRollNo,
  findUserById,
  verifyPassword,
  toPublicUser,
} from "../services/auth.data.js";
import { signAuthToken } from "../middleware/auth.middleware.js";

const signupSchema = z.object({
  name: z.string().trim().min(1),
  rollNo: z.string().trim().min(1).toUpperCase(),
  password: z.string().min(8),
  email: z.string().trim().email().optional(),
});

// ── POST /api/auth/signup ────────────────────────────────────────────────────
export async function signup(req: Request, res: Response) {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
    return;
  }
  const existing = await findUserByRollNo(result.data.rollNo);
  if (existing) {
    res.status(409).json({ error: "An account with this roll number already exists" });
    return;
  }
  const user = await createUser(result.data);
  const token = signAuthToken({ sub: user.id, role: user.role, rollNo: user.rollNo });
  res.status(201).json({ data: { user: toPublicUser(user), token } });
}

const loginSchema = z.object({
  rollNo: z.string().trim().min(1).toUpperCase(),
  password: z.string().min(1),
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
export async function login(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
    return;
  }
  const user = await findUserByRollNo(result.data.rollNo);
  if (!user || !(await verifyPassword(result.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Incorrect roll number or password" });
    return;
  }
  const token = signAuthToken({ sub: user.id, role: user.role, rollNo: user.rollNo });
  res.json({ data: { user: toPublicUser(user), token } });
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export async function me(req: Request, res: Response) {
  const user = await findUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: "Account not found" });
    return;
  }
  res.json({ data: toPublicUser(user) });
}
