import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { success } from "../utils/response.js";
import { login, register } from "../services/auth.service.js";

export const postRegister = async (req: Request, res: Response) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'Sign up new user'

    const data = await register(req.body);
    res.status(StatusCodes.CREATED).json(success("User registered successfully", data));
}


export const postLogin = async (req: Request, res: Response) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'Log in user'

    const data = await login(req.body);

    res.status(StatusCodes.OK).json(success("User logged in successfully", data));
}
