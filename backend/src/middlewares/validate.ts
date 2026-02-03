import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { formatZodErrorsAsObject } from "../utils/errors.js";
import { fail } from "../utils/response.js";

export function validate<T extends z.ZodTypeAny>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const msgs: Record<string, string> = formatZodErrorsAsObject(result.error);
            const code = StatusCodes.BAD_REQUEST;
            return res.status(code).json(fail("request validation failed", msgs));

        } else {
            next();
        }
    }
}


export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const msgs: Record<string, string> = formatZodErrorsAsObject(result.error);
            const code = StatusCodes.BAD_REQUEST;
            return res.status(code).json(fail(code, "query string validation failed", msgs));

        } else {
            next();
        }
    }
}
