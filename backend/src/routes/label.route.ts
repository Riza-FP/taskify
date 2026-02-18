import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { deleteLabels, postLabels, putLabels, searchLabels } from "../controllers/label.controller.js";

const router = Router();
router.post("/", authenticate, postLabels);
router.put("/:id", authenticate, putLabels);
router.delete("/:id", authenticate, deleteLabels);
router.get("/", authenticate, searchLabels);
export default router;
