import { loadEnv } from "./config/env.js";

// Load .env before anything reads process.env
loadEnv();

import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { initDb } from "./db/postgres.js";

const app = createApp();

try {
  await initDb();
} catch (err) {
  console.error("\n❌  Could not connect to the database — check DATABASE_URL in backend/.env\n", err);
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`\n🚀  LearnWise AI backend running`);
  console.log(`   http://localhost:${env.port}/health`);
  console.log(`   http://localhost:${env.port}/api/academics/subjects`);
  console.log(`   http://localhost:${env.port}/api/students\n`);
});
