import type z from "zod";
import type { LoginUserSchema, RegisterUserSchema } from "../schemas/auth.schema.js";

export type RegisterUserSchemaType = z.infer<typeof RegisterUserSchema>;
export type LoginUserSchemaType = z.infer<typeof LoginUserSchema>;
