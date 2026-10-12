import type { Request, Response } from "express";
import { z } from "zod";
import {
  getRecords,
  addRecord,
  deleteRecord,
  resources,
  topicStats,
  subjectStats,
  pickQuestions,
  subjects,
  topicsBySubject,
} from "../services/academics.data.js";

// ── GET /api/academics/records ────────────────────────────────────────────────
export function listRecords(_req: Request, res: Response) {
  res.json({ data: getRecords() });
}

// ── POST /api/academics/records ───────────────────────────────────────────────
const createRecordSchema = z.object({
  subject:  z.string().min(1),
  topic:    z.string().min(1),
  score:    z.number().nonnegative(),
  max:      z.number().positive(),
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  type:     z.enum(["Quiz", "Exam", "Assignment", "Practice"]),
  mistakes: z.string().default(""),
});

export function createRecord(req: Request, res: Response) {
  const result = createRecordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
    return;
  }
  const record = addRecord(result.data);
  res.status(201).json({ data: record });
}

// ── DELETE /api/academics/records/:id ────────────────────────────────────────
export function removeRecord(req: Request, res: Response) {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = deleteRecord(id);
  if (!deleted) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  res.status(204).send();
}

// ── GET /api/academics/stats/topics ──────────────────────────────────────────
export function listTopicStats(_req: Request, res: Response) {
  res.json({ data: topicStats(getRecords()) });
}

// ── GET /api/academics/stats/subjects ────────────────────────────────────────
export function listSubjectStats(_req: Request, res: Response) {
  res.json({ data: subjectStats(getRecords()) });
}

// ── GET /api/academics/resources ─────────────────────────────────────────────
export function listResources(req: Request, res: Response) {
  const { subject, topic } = req.query as Record<string, string | undefined>;
  let filtered = resources;
  if (subject) filtered = filtered.filter((r) => r.subject === subject);
  if (topic)   filtered = filtered.filter((r) => r.topic   === topic);
  res.json({ data: filtered });
}

// ── GET /api/academics/questions ─────────────────────────────────────────────
export function listQuestions(req: Request, res: Response) {
  const { subject, topic = "Any", difficulty = "Mixed", count = "5" } = req.query as Record<string, string | undefined>;
  if (!subject) {
    res.status(400).json({ error: "subject query param is required" });
    return;
  }
  const questions = pickQuestions(subject, topic, difficulty, Number(count));
  res.json({ data: questions });
}

// ── GET /api/academics/subjects ──────────────────────────────────────────────
export function listSubjects(_req: Request, res: Response) {
  res.json({ data: subjects, topicsBySubject });
}
