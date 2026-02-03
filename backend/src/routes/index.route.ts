import { Router } from "express";
import authRoutes from "./auth.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/healthcheck", (_, res) => { res.status(200).json({ status: "operational" }) })
export default router;
