import type { Request, Response } from "express";
import { z } from "zod";
import "../middleware/student.middleware.js"; // augments Request with studentId
import {
  getRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  resources,
  topicStats,
  subjectStats,
  pickQuestions,
  weakestTopic,
  recommendResources,
  subjects,
  topicsBySubject,
} from "../services/academics.data.js";

// ── GET /api/academics/records ────────────────────────────────────────────────
export async function listRecords(req: Request, res: Response) {
  res.json({ data: await getRecords(req.studentId!) });
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

export async function createRecord(req: Request, res: Response) {
  const result = createRecordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
    return;
  }
  const record = await addRecord(req.studentId!, result.data);
  res.status(201).json({ data: record });
}

// ── PUT /api/academics/records/:id ───────────────────────────────────────────
export async function editRecord(req: Request, res: Response) {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const result = createRecordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
    return;
  }
  const record = await updateRecord(req.studentId!, id, result.data);
  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  res.json({ data: record });
}

// ── DELETE /api/academics/records/:id ────────────────────────────────────────
export async function removeRecord(req: Request, res: Response) {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = await deleteRecord(req.studentId!, id);
  if (!deleted) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  res.status(204).send();
}

// ── GET /api/academics/stats/topics ──────────────────────────────────────────
export async function listTopicStats(req: Request, res: Response) {
  res.json({ data: topicStats(await getRecords(req.studentId!)) });
}

// ── GET /api/academics/stats/subjects ────────────────────────────────────────
export async function listSubjectStats(req: Request, res: Response) {
  res.json({ data: subjectStats(await getRecords(req.studentId!)) });
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
// Omit `subject` to get questions personalized to the weakest topic found
// in the student's own records (easier difficulty for "Weak", medium for
// "Revise"). Pass subject/topic/difficulty explicitly to override.
export async function listQuestions(req: Request, res: Response) {
  const { subject, topic, difficulty, count = "5" } = req.query as Record<string, string | undefined>;

  let targetSubject = subject;
  let targetTopic = topic ?? "Any";
  let targetDifficulty = difficulty;
  let personalized = false;

  if (!targetSubject) {
    const gap = weakestTopic(await getRecords(req.studentId!));
    if (!gap) {
      res.status(400).json({ error: "subject query param is required (no performance data yet to personalize from)" });
      return;
    }
    targetSubject = gap.subject;
    targetTopic = gap.topic;
    targetDifficulty ??= gap.status === "Weak" ? "Easy" : gap.status === "Revise" ? "Medium" : "Mixed";
    personalized = true;
  }
  targetDifficulty ??= "Mixed";

  const questions = pickQuestions(targetSubject, targetTopic, targetDifficulty, Number(count));
  res.json({ data: questions, personalized, subject: targetSubject, topic: targetTopic, difficulty: targetDifficulty });
}

// ── GET /api/academics/recommendations ───────────────────────────────────────
// Gap-driven resource recommendations: pulls materials for every topic that
// isn't "Strong" yet, easiest-first for "Weak" topics. Optional ?subject=
// narrows to one subject; ?limit= caps the result count (default 8).
export async function listRecommendations(req: Request, res: Response) {
  const { subject, limit = "8" } = req.query as Record<string, string | undefined>;
  const data = recommendResources(await getRecords(req.studentId!), subject, Number(limit));
  res.json({ data });
}

// ── GET /api/academics/subjects ──────────────────────────────────────────────
// Not student-scoped — a static reference catalog, same for everyone.
export function listSubjects(_req: Request, res: Response) {
  res.json({ data: subjects, topicsBySubject });
}
