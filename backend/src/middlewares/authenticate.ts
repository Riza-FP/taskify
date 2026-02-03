import type { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../utils/errors.js";
import { verifyJWT, type JwtPayload } from "../utils/tokenize.js";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const auth_header = req.headers.authorization;
    const jwt = auth_header && auth_header.split(' ')[1];

    if (!jwt) {
        throw new AuthenticationError("auth token is missing");
    }

    const payload: JwtPayload = await verifyJWT(jwt);

    (req as any).user = payload;
    next();
}
