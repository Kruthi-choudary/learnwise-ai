import { Router } from "express";
import {
  listStudents,
  getStudent,
  listOpportunities,
  listTasks,
  listGoals,
  getWeeklyActivity,
} from "../controllers/student.controller.js";

const router = Router();

router.get("/students",          listStudents);
router.get("/students/:roll",    getStudent);
router.get("/opportunities",     listOpportunities);
router.get("/tasks",             listTasks);
router.get("/goals",             listGoals);
router.get("/activity/weekly",   getWeeklyActivity);

export default router;
