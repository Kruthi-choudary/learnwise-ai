import { Router } from "express";
import { requireStudentId } from "../middleware/student.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";
import {
  listRecords,
  createRecord,
  editRecord,
  removeRecord,
  listTopicStats,
  listSubjectStats,
  listResources,
  listQuestions,
  listRecommendations,
  listSubjects,
} from "../controllers/academics.controller.js";

const router = Router();

// Static reference catalogs — same for every visitor, no identity needed.
router.get("/subjects",  listSubjects);
router.get("/resources", listResources);

// Student-scoped routes — require an X-Student-Id header (see student.middleware.ts).
// Wrapped in asyncHandler: these controllers now query Postgres, and Express 4
// doesn't forward a rejected promise to error middleware on its own.
router.use(requireStudentId);
router.get("/records",         asyncHandler(listRecords));
router.post("/records",        asyncHandler(createRecord));
router.put("/records/:id",     asyncHandler(editRecord));
router.delete("/records/:id",  asyncHandler(removeRecord));
router.get("/stats/topics",    asyncHandler(listTopicStats));
router.get("/stats/subjects",  asyncHandler(listSubjectStats));
router.get("/questions",       asyncHandler(listQuestions));
router.get("/recommendations", asyncHandler(listRecommendations));

export default router;
