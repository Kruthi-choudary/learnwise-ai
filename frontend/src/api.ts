// ── LearnWise AI — backend API client ────────────────────────────────────────
//
// Base URL is read from the VITE_API_URL env var (set in .env.local for dev).
// Falls back to http://localhost:3001 so the app still works without a .env.local.
//
// All functions are typed to match the exact JSON shapes returned by the backend
// (see backend/src/models/academics.model.ts and backend/src/models/student.model.ts).

import { getStudentId } from "@/lib/student-id";

// ── Shared response types ────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  env: string;
  timestamp: string;
}

export interface SubjectsResponse {
  data: readonly string[];
  topicsBySubject: Record<string, string[]>;
}

export type StudentStatus = "On track" | "Needs support" | "Placement ready";

export interface CampusStudent {
  roll: string;
  name: string;
  dept: string;
  year: number;
  progress: number;
  attendance: number;
  status: StudentStatus;
}

export interface StudentsResponse {
  data: CampusStudent[];
}

// ── Academics (Performance Lab) types ────────────────────────────────────────

export type RecordType = "Quiz" | "Exam" | "Assignment" | "Practice";

export interface PerfRecord {
  id: number;
  subject: string;
  topic: string;
  score: number;
  max: number;
  date: string;
  type: RecordType;
  mistakes: string;
}

export interface RecordsResponse {
  data: PerfRecord[];
}

export interface RecordResponse {
  data: PerfRecord;
}

export type TopicStatus = "Weak" | "Revise" | "Strong";

export interface TopicStat {
  subject: string;
  topic: string;
  pct: number;
  attempts: number;
  trend: number;
  mistakes: string[];
  status: TopicStatus;
}

export interface TopicStatsResponse {
  data: TopicStat[];
}

export interface SubjectStat {
  subject: string;
  pct: number;
  count: number;
}

export interface SubjectStatsResponse {
  data: SubjectStat[];
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  subject: string;
  topic: string;
  kind: "Video" | "Notes" | "Docs" | "Tutorial" | "Practice";
  difficulty: "Easy" | "Medium" | "Hard";
  minutes: number;
  url: string;
}

export interface ResourcesResponse {
  data: Resource[];
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  q: string;
  options: string[];
  answer: number;
  hint: string;
  explanation: string;
}

export interface QuestionsResponse {
  data: Question[];
  personalized: boolean;
  subject: string;
  topic: string;
  difficulty: string;
}

// ── Custom error class ───────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
    public readonly originalCause?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Base URL (from Vite env var, with fallback) ──────────────────────────────

const API_BASE_URL: string =
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:3001";

// ── Core fetch helper ────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  // Catch network failures (server down, DNS, CORS preflight blocked, etc.)
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch (cause) {
    throw new ApiError(
      `Network error — could not reach the backend at ${API_BASE_URL}. Is it running?`,
      null,
      cause,
    );
  }

  // Non-2xx HTTP status
  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { error?: string };
      detail = body.error ? ` — ${body.error}` : "";
    } catch {
      // ignore JSON parse failure on error bodies
    }
    throw new ApiError(
      `${response.status} ${response.statusText}${detail} (${path})`,
      response.status,
    );
  }

  // No body to parse (e.g. a successful DELETE)
  if (response.status === 204) {
    return undefined as T;
  }

  // JSON parse failure on a successful response
  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new ApiError(`Failed to parse JSON response from ${path}`, response.status, cause);
  }
}

function studentHeaders(extra?: Record<string, string>): HeadersInit {
  return { "X-Student-Id": getStudentId(), ...extra };
}

// ── Public API functions ─────────────────────────────────────────────────────

/** GET /health — confirms the backend is reachable. */
export function checkBackend(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

/**
 * GET /api/academics/subjects
 * Returns the list of subjects and their topics.
 * Response shape: { data: string[], topicsBySubject: Record<string, string[]> }
 */
export function getSubjects(): Promise<SubjectsResponse> {
  return request<SubjectsResponse>("/api/academics/subjects");
}

/**
 * GET /api/students
 * Returns all campus students.
 * Response shape: { data: CampusStudent[] }
 */
export function getStudents(): Promise<StudentsResponse> {
  return request<StudentsResponse>("/api/students");
}

// ── Academics (Performance Lab) ───────────────────────────────────────────────
// Record/stat/question endpoints are scoped to this browser's anonymous
// student id (see src/lib/student-id.ts) — no login, just enough identity to
// keep two visitors' marks from colliding in the shared backend.

/** GET /api/academics/records */
export function getAcademicRecords(): Promise<RecordsResponse> {
  return request<RecordsResponse>("/api/academics/records", { headers: studentHeaders() });
}

/** POST /api/academics/records */
export function createAcademicRecord(data: Omit<PerfRecord, "id">): Promise<RecordResponse> {
  return request<RecordResponse>("/api/academics/records", {
    method: "POST",
    headers: studentHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
}

/** PUT /api/academics/records/:id */
export function updateAcademicRecord(id: number, data: Omit<PerfRecord, "id">): Promise<RecordResponse> {
  return request<RecordResponse>(`/api/academics/records/${id}`, {
    method: "PUT",
    headers: studentHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
}

/** DELETE /api/academics/records/:id */
export function deleteAcademicRecord(id: number): Promise<void> {
  return request<void>(`/api/academics/records/${id}`, {
    method: "DELETE",
    headers: studentHeaders(),
  });
}

/** GET /api/academics/stats/topics */
export function getTopicStats(): Promise<TopicStatsResponse> {
  return request<TopicStatsResponse>("/api/academics/stats/topics", { headers: studentHeaders() });
}

/** GET /api/academics/stats/subjects */
export function getSubjectStats(): Promise<SubjectStatsResponse> {
  return request<SubjectStatsResponse>("/api/academics/stats/subjects", { headers: studentHeaders() });
}

/** GET /api/academics/resources — static catalog, same for every visitor. */
export function getResources(): Promise<ResourcesResponse> {
  return request<ResourcesResponse>("/api/academics/resources");
}

/**
 * GET /api/academics/questions
 * Omit subject/topic/difficulty to get a set personalized to this student's
 * weakest topic (see backend's listQuestions for the exact rule).
 */
export function getQuestions(params: {
  subject?: string;
  topic?: string;
  difficulty?: string;
  count?: number;
}): Promise<QuestionsResponse> {
  const qs = new URLSearchParams();
  if (params.subject) qs.set("subject", params.subject);
  if (params.topic) qs.set("topic", params.topic);
  if (params.difficulty) qs.set("difficulty", params.difficulty);
  if (params.count) qs.set("count", String(params.count));
  const query = qs.toString();
  return request<QuestionsResponse>(`/api/academics/questions${query ? `?${query}` : ""}`, {
    headers: studentHeaders(),
  });
}
