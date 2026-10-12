// Postgres persistence (Supabase) for per-student performance records.
// connectionString is read lazily (not validated at module load) so tests
// that only exercise the pure gap-analysis functions can import this module
// without a real DATABASE_URL — pg's Pool itself doesn't connect until the
// first query runs, and initDb() is the only thing that calls one at startup.
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
  // Supabase requires TLS; Node's default CA bundle doesn't always validate
  // its chain, so we skip strict verification (standard for Supabase + pg).
  ssl: { rejectUnauthorized: false },
});

export async function initDb(): Promise<void> {
  if (!process.env["DATABASE_URL"]) {
    throw new Error("DATABASE_URL is required — set it in backend/.env (a Supabase/Postgres connection string).");
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      score REAL NOT NULL,
      max REAL NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      mistakes TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_records_student ON records(student_id);
  `);
}
