import type { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../utils/errors.js";
import { verifyJWT, type JwtPayload } from "../utils/tokenize.js";
import { authClientFactory, supabase } from "../lib/supabase.js";

export const authenticateCustomJWT = async (req: Request, res: Response, next: NextFunction) => {
    const auth_header = req.headers.authorization;
    const jwt = auth_header && auth_header.split(' ')[1];

    if (!jwt) {
        throw new AuthenticationError("auth token is missing");
    }

    const payload: JwtPayload = await verifyJWT(jwt);

    (req as any).user = payload;
    next();
}


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthenticationError("No token provided");
    }

    const token = authHeader.split(" ")[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.log(error, user)
        throw new AuthenticationError("Invalid or expired token");
    }

    (req as any).user = user;
    (req as any).supabase = authClientFactory(token);
    next();
}
