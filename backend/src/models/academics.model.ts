// Academic performance data shapes.
// These mirror the frontend's src/data/academics.ts types exactly
// so the API contract matches what the UI already expects.

export type RecordType = "Quiz" | "Exam" | "Assignment" | "Practice";

export interface PerfRecord {
  id: number;
  subject: string;
  topic: string;
  score: number;
  max: number;
  date: string; // ISO date string: YYYY-MM-DD
  type: RecordType;
  mistakes: string;
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

export interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  q: string;
  options: string[];
  answer: number; // index into options
  hint: string;
  explanation: string;
}

export interface TopicStat {
  subject: string;
  topic: string;
  pct: number;
  attempts: number;
  trend: number;
  mistakes: string[];
  status: "Weak" | "Revise" | "Strong";
}

export interface SubjectStat {
  subject: string;
  pct: number;
  count: number;
}
