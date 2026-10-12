import type { Request, Response } from "express";
import {
  campusStudents,
  opportunities,
  initialTasks,
  goals,
  weeklyActivity,
} from "../services/student.data.js";

// ── GET /api/students ─────────────────────────────────────────────────────────
export function listStudents(_req: Request, res: Response) {
  res.json({ data: campusStudents });
}

// ── GET /api/students/:roll ───────────────────────────────────────────────────
export function getStudent(req: Request, res: Response) {
  const student = campusStudents.find((s) => s.roll === req.params["roll"]);
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json({ data: student });
}

// ── GET /api/opportunities ────────────────────────────────────────────────────
export function listOpportunities(req: Request, res: Response) {
  const { type } = req.query as { type?: string };
  const filtered = type
    ? opportunities.filter((o) => o.type === type)
    : opportunities;
  res.json({ data: filtered });
}

// ── GET /api/tasks ────────────────────────────────────────────────────────────
export function listTasks(_req: Request, res: Response) {
  res.json({ data: initialTasks });
}

// ── GET /api/goals ────────────────────────────────────────────────────────────
export function listGoals(_req: Request, res: Response) {
  res.json({ data: goals });
}

// ── GET /api/activity/weekly ──────────────────────────────────────────────────
export function getWeeklyActivity(_req: Request, res: Response) {
  res.json({ data: weeklyActivity });
}
