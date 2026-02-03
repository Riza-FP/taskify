import { ClientError } from "../utils/errors.js";
import { fail } from "../utils/response.js";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";

export const errorHandler = (err: unknown, req: Request, res: Response, _: NextFunction) => {
    console.error(err);

    if (err instanceof ClientError) {
        return res.status(err.statusCode).json(fail(err.message));
    }


    // multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(StatusCodes.BAD_REQUEST).json(fail("File size cannot exceeds 3 MB"));
        }
    }

    // fallback
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(fail("Oops! something went wrong"));
};
