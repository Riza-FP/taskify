import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getNotifications, putNotifications } from "../controllers/notification.controller.js";

const router = Router();
router.get("/", authenticate, getNotifications);
router.put("/:id", authenticate, putNotifications);

export default router;

