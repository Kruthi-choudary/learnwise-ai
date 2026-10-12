import { loadEnv } from "./config/env.js";

// Load .env before anything reads process.env
loadEnv();

import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`\n🚀  LearnWise AI backend running`);
  console.log(`   http://localhost:${env.port}/health`);
  console.log(`   http://localhost:${env.port}/api/academics/subjects`);
  console.log(`   http://localhost:${env.port}/api/students\n`);
});
