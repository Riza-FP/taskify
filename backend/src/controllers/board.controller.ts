import type { Request, Response } from "express";
import { createBoard, getAllBoards, getBoardById } from "../services/board.service.js";
import { StatusCodes } from "http-status-codes";
import { success } from "../utils/response.js";


export const postBoards = async (req: Request, res: Response) => {
    const { id } = (req as any).user;
    const { title, description } = req.body;
    const supabase = (req as any).supabase;
    const user_id = String(id);

    const data = await createBoard(
        supabase,
        {
            user_id,
            title,
            description,
        }
    );

    res.status(StatusCodes.CREATED).json(success("Board created successfully", data));
}


export const getBoards = async (req: Request, res: Response) => {
    const client = (req as any).supabase;
    const boards = await getAllBoards(client);

    res.status(StatusCodes.OK).json(success("Boards fetched successfully", boards));
}


export const getBoardsById = async (req: Request, res: Response) => {
    const client = (req as any).supabase;
    const { id } = req.params;
    const board = await getBoardById(client, Number(id));

    res.status(StatusCodes.OK).json(success("Board fetched successfully", board));
}

