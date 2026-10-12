// SQLite persistence for per-student performance records.
// Uses Node's built-in node:sqlite (Node 22+) — no extra dependency.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../../data/learnwise.sqlite");
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    score REAL NOT NULL,
    max REAL NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    mistakes TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX IF NOT EXISTS idx_records_student ON records(studentId);
`);
