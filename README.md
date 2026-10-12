# LearnWise AI — ElevateOS

> Your Goals. Your Growth. Your Next Move.  
> A student workspace for learning, focus, and career growth.

---

## Project structure

```
learnwise-ai/
├── frontend/          # TanStack Start (React 19 + TanStack Router + Vite + Tailwind)
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── elevate/   # Feature components (academics, planner, goals, …)
│       │   └── ui/        # shadcn/ui primitives
│       ├── data/          # Demo seed data (academics.ts, demo.ts)
│       ├── hooks/
│       ├── lib/
│       ├── routes/        # TanStack file-based routes (one file = one URL)
│       ├── styles.css     # Design tokens + Tailwind base
│       └── router.tsx
│
├── backend/           # Express + TypeScript REST API
│   ├── src/
│   │   ├── app.ts         # Express app factory
│   │   ├── index.ts       # Entry point — starts the server
│   │   ├── config/        # env.ts — centralised environment config
│   │   ├── controllers/   # Route handler functions
│   │   ├── middleware/     # Error handler, request logger
│   │   ├── models/        # TypeScript interfaces / shapes
│   │   ├── routes/        # Express routers
│   │   └── services/      # Data layer (in-memory seed; swap for DB later)
│   └── tests/             # Vitest unit tests
│
├── .project/          # Lovable project metadata (do not edit manually)
├── .env.example       # Root-level env reference
├── .gitignore
└── README.md
```

---

## Tech stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 19, TanStack Start, TanStack Router, Vite 8, Tailwind CSS 4, shadcn/ui, Framer Motion, Recharts |
| Backend  | Node.js, Express 4, TypeScript 5, Zod, tsx (dev runner) |
| Testing  | Vitest (both frontend and backend) |
| Package manager | Bun (frontend) · npm or Bun (backend) |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ **or** [Bun](https://bun.sh/) 1.1+
- (Optional) A `.env` file in `backend/` — see `.env.example`

---

### Frontend

```bash
cd frontend
bun install        # or: npm install
bun run dev        # or: npm run dev
```

Runs at **http://localhost:3000** (default TanStack Start / Vite port).

Other commands:

```bash
bun run build      # production build → frontend/.output/
bun run preview    # preview the production build
bun run test       # run Vitest tests once
bun run lint       # ESLint
bun run format     # Prettier
```

---

### Backend

```bash
cd backend
npm install        # or: bun install
npm run dev        # or: bun run dev
```

Runs at **http://localhost:3001**.

Other commands:

```bash
npm run build      # compile TypeScript → backend/dist/
npm start          # run compiled output (after build)
npm test           # run Vitest tests once
```

Copy `.env.example` → `backend/.env` and edit before starting:

```bash
cp backend/.env.example backend/.env
```

---

## API reference

Base URL: `http://localhost:3001`

### Health

| Method | Path      | Description |
|--------|-----------|-------------|
| GET    | `/health` | Server health + timestamp |

### Academics

| Method | Path                              | Description |
|--------|-----------------------------------|-------------|
| GET    | `/api/academics/subjects`         | All subjects and their topics |
| GET    | `/api/academics/records`          | All performance records |
| POST   | `/api/academics/records`          | Add a performance record |
| DELETE | `/api/academics/records/:id`      | Remove a record |
| GET    | `/api/academics/stats/topics`     | Per-topic stats (pct, trend, status) |
| GET    | `/api/academics/stats/subjects`   | Per-subject aggregate stats |
| GET    | `/api/academics/resources`        | Study resources (filter: `?subject=&topic=`) |
| GET    | `/api/academics/questions`        | Practice questions (`?subject=&topic=&difficulty=&count=`) |

### Students & content

| Method | Path                    | Description |
|--------|-------------------------|-------------|
| GET    | `/api/students`         | All campus students |
| GET    | `/api/students/:roll`   | Single student by roll number |
| GET    | `/api/opportunities`    | Opportunities (filter: `?type=`) |
| GET    | `/api/tasks`            | Daily tasks |
| GET    | `/api/goals`            | Student goals |
| GET    | `/api/activity/weekly`  | Weekly learning + coding activity |

---

## Environment variables

| Variable        | Default                    | Description |
|-----------------|----------------------------|-------------|
| `PORT`          | `3001`                     | Backend server port |
| `NODE_ENV`      | `development`              | `development` or `production` |
| `CORS_ORIGIN`   | `http://localhost:3000`    | Allowed frontend origin |
| `JWT_SECRET`    | *(dev placeholder)*        | Secret for JWT signing |
| `DATABASE_URL`  | *(not set)*                | Postgres connection (optional) |

Frontend Vite env vars must be prefixed with `VITE_` to be exposed to the browser (e.g. `VITE_API_URL=http://localhost:3001`).

---

## Architecture notes

- **Frontend** is a demo-only SSR app — all data lives in React context (`AcademicsProvider`) and `src/data/*.ts`. No real API calls are made in the current UI.
- **Backend** ships the same seed data via REST. Wire the frontend to the backend by replacing the in-memory context calls with `fetch`/`useQuery` calls to `VITE_API_URL`.
- The `backend/src/services/` data layer is intentionally thin — swap the in-memory arrays for database queries without touching controllers or routes.
- `.project/` (formerly `.lovable/`) holds Lovable project metadata. Do not force-push or rebase published commits — it rewrites history on Lovable's side.
