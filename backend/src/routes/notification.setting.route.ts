import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { deleteTasks, postTasks, putTasks } from "../controllers/task.controller.js";
import { getNotificationSettings, putNotificationSettings } from "../controllers/notification.controller.js";

const router = Router();
router.get("/", authenticate, getNotificationSettings);
router.put("/", authenticate, putNotificationSettings);

export default router;

