// Per-user tasks and goals — a real account's own data, unlike the shared
// demo seed in student.data.ts. Empty until the user adds something; no
// ensureSeeded step here (compare academics.data.ts's anonymous-visitor seed).

import { pool } from "../db/postgres.js";
import type { Task, Goal } from "../models/student.model.js";

interface TaskRow {
  id: number;
  title: string;
  goal: string;
  duration: number;
  priority: string;
  color: string;
  done: boolean;
}

interface GoalRow {
  id: number;
  title: string;
  subtitle: string;
  progress: number;
  color: string;
}

export async function listTasks(userId: string): Promise<Task[]> {
  const { rows } = await pool.query<TaskRow>(
    "SELECT id, title, goal, duration, priority, color, done FROM user_tasks WHERE user_id = $1 ORDER BY id ASC",
    [userId],
  );
  return rows;
}

export async function createTask(userId: string, data: Omit<Task, "id" | "done">): Promise<Task> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO user_tasks (user_id, title, goal, duration, priority, color)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [userId, data.title, data.goal, data.duration, data.priority, data.color],
  );
  return { id: rows[0]!.id, done: false, ...data };
}

export async function toggleTask(userId: string, id: number): Promise<Task | null> {
  const { rows } = await pool.query<TaskRow>(
    `UPDATE user_tasks SET done = NOT done WHERE user_id = $1 AND id = $2
     RETURNING id, title, goal, duration, priority, color, done`,
    [userId, id],
  );
  return rows[0] ?? null;
}

export async function deleteTask(userId: string, id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM user_tasks WHERE user_id = $1 AND id = $2", [userId, id]);
  return (result.rowCount ?? 0) > 0;
}

export async function listGoals(userId: string): Promise<Goal[]> {
  const { rows } = await pool.query<GoalRow>(
    "SELECT id, title, subtitle, progress, color FROM user_goals WHERE user_id = $1 ORDER BY id ASC",
    [userId],
  );
  return rows;
}

export async function createGoal(userId: string, data: Omit<Goal, "id">): Promise<Goal> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO user_goals (user_id, title, subtitle, progress, color)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [userId, data.title, data.subtitle, data.progress, data.color],
  );
  return { id: rows[0]!.id, ...data };
}

export async function deleteGoal(userId: string, id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM user_goals WHERE user_id = $1 AND id = $2", [userId, id]);
  return (result.rowCount ?? 0) > 0;
}
