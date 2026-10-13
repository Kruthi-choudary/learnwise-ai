import type { Request, Response } from "express";
import { z } from "zod";
import {
  listTasks,
  createTask,
  toggleTask,
  deleteTask,
  listGoals,
  createGoal,
  deleteGoal,
} from "../services/user-content.data.js";

// ── GET /api/me/tasks ─────────────────────────────────────────────────────────
export async function getTasks(req: Request, res: Response) {
  res.json({ data: await listTasks(req.userId!) });
}

const createTaskSchema = z.object({
  title: z.string().trim().min(1),
  goal: z.string().trim().min(1),
  duration: z.number().positive(),
  priority: z.string().trim().min(1),
  color: z.string().default(""),
});

// ── POST /api/me/tasks ────────────────────────────────────────────────────────
export async function postTask(req: Request, res: Response) {
  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
    return;
  }
  const task = await createTask(req.userId!, result.data);
  res.status(201).json({ data: task });
}

// ── PATCH /api/me/tasks/:id ───────────────────────────────────────────────────
export async function patchTask(req: Request, res: Response) {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const task = await toggleTask(req.userId!, id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json({ data: task });
}

// ── DELETE /api/me/tasks/:id ──────────────────────────────────────────────────
export async function removeTask(req: Request, res: Response) {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await deleteTask(req.userId!, id);
  if (!deleted) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.status(204).send();
}

// ── GET /api/me/goals ─────────────────────────────────────────────────────────
export async function getGoals(req: Request, res: Response) {
  res.json({ data: await listGoals(req.userId!) });
}

const createGoalSchema = z.object({
  title: z.string().trim().min(1),
  subtitle: z.string().default(""),
  progress: z.number().min(0).max(100).default(0),
  color: z.string().default(""),
});

// ── POST /api/me/goals ────────────────────────────────────────────────────────
export async function postGoal(req: Request, res: Response) {
  const result = createGoalSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
    return;
  }
  const goal = await createGoal(req.userId!, result.data);
  res.status(201).json({ data: goal });
}

// ── DELETE /api/me/goals/:id ──────────────────────────────────────────────────
export async function removeGoal(req: Request, res: Response) {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await deleteGoal(req.userId!, id);
  if (!deleted) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  res.status(204).send();
}
