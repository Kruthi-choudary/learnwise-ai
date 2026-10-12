// Postgres persistence (Supabase) for per-student performance records.
// connectionString is read lazily (not validated at module load) so tests
// that only exercise the pure gap-analysis functions can import this module
// without a real DATABASE_URL — pg's Pool itself doesn't connect until the
// first query runs, and initDb() is the only thing that calls one at startup.
import { Pool } from "pg";
import { loadEnv } from "../config/env.js";

// index.ts calls loadEnv() too, but ES module imports are all evaluated
// before an importing file's own top-level statements run — so app.ts's
// import chain (→ routes → controllers → academics.data.ts → this file)
// actually runs before index.ts's loadEnv() call does. Calling it here too
// guarantees DATABASE_URL is populated before the Pool below reads it,
// regardless of import order elsewhere. (dotenv's config() is idempotent.)
loadEnv();

// Supabase's dashboard "Connection string" copy includes `?sslmode=require`
// by default. Combined with an explicit `ssl` option, current `pg` versions
// silently upgrade that to full certificate-chain verification — which then
// fails because Node's default CA bundle doesn't include Supabase's chain.
// Stripping sslmode here means our own `ssl` option below is what actually
// applies, regardless of what a pasted-from-the-dashboard string includes.
function withoutSslModeParam(connectionString: string | undefined): string | undefined {
  if (!connectionString) return connectionString;
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch {
    return connectionString;
  }
}

export const pool = new Pool({
  connectionString: withoutSslModeParam(process.env["DATABASE_URL"]),
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
