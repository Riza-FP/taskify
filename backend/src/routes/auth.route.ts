import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { LoginUserSchema, RegisterUserSchema } from "../schemas/auth.schema.js";
import { postLogin, postRegister } from "../controllers/auth.controller.js";

const router = Router();
router.post("/register", validate(RegisterUserSchema), postRegister);
router.post("/login", validate(LoginUserSchema), postLogin);
export default router;
