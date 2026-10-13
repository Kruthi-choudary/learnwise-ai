import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";
import {
  getTasks,
  postTask,
  patchTask,
  removeTask,
  getGoals,
  postGoal,
  removeGoal,
} from "../controllers/user-content.controller.js";

const router = Router();

// Every route here is a real signed-in user's own data — Demo mode never hits these.
router.use(requireAuth);

router.get("/tasks", asyncHandler(getTasks));
router.post("/tasks", asyncHandler(postTask));
router.patch("/tasks/:id", asyncHandler(patchTask));
router.delete("/tasks/:id", asyncHandler(removeTask));

router.get("/goals", asyncHandler(getGoals));
router.post("/goals", asyncHandler(postGoal));
router.delete("/goals/:id", asyncHandler(removeGoal));

export default router;
