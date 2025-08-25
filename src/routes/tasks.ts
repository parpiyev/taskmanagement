import { Router } from "express";
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} from "../controllers/taskController";
import { authenticate } from "../middleware/auth";
import { validateTaskData } from "../utils/validation";

const router = Router();

router.use(authenticate);

router.get("/", getTasks);
router.post("/", validateTaskData, createTask);
router.get("/:id", getTask);
router.put("/:id", validateTaskData, updateTask);
router.patch("/:id/toggle", toggleTaskCompletion);
router.delete("/:id", deleteTask);

export { router as taskRoutes };
