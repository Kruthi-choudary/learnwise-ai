import { Router } from "express";
import { requireStudentId } from "../middleware/student.middleware.js";
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
router.use(requireStudentId);
router.get("/records",         listRecords);
router.post("/records",        createRecord);
router.put("/records/:id",     editRecord);
router.delete("/records/:id",  removeRecord);
router.get("/stats/topics",    listTopicStats);
router.get("/stats/subjects",  listSubjectStats);
router.get("/questions",       listQuestions);
router.get("/recommendations", listRecommendations);

export default router;
