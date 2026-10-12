// ── LearnWise AI — backend API client ────────────────────────────────────────
//
// Base URL is read from the VITE_API_URL env var (set in .env.local for dev).
// Falls back to http://localhost:3001 so the app still works without a .env.local.
//
// All functions are typed to match the exact JSON shapes returned by the backend
// (see backend/src/models/academics.model.ts and backend/src/models/student.model.ts).

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

  // JSON parse failure on a successful response
  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new ApiError(`Failed to parse JSON response from ${path}`, response.status, cause);
  }
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
