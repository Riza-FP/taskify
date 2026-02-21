import type { Request, Response } from "express";
import { createBoard, deleteBoard, getAllBoards, getBoardById, updateBoard } from "../services/board.service.js";
import { StatusCodes } from "http-status-codes";
import { success } from "../utils/response.js";
import type { UpdateBoardDTO } from "../types/board.type.js";
import type { SortFilter } from "../types/filter.type.js";

export const postBoards = async (req: Request, res: Response) => {
    // #swagger.tags = ['Board']
    // #swagger.summary = 'Create new Kanban Board'


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
    // #swagger.tags = ['Board']
    // #swagger.summary = 'Get all boards that the logged in user have'

    const client = (req as any).supabase;
    const boards = await getAllBoards(client);

    res.status(StatusCodes.OK).json(success("Boards fetched successfully", boards));
}


export const getBoardsById = async (req: Request, res: Response) => {
    // #swagger.tags = ['Board']
    // #swagger.summary = 'Get a board by its Id, also loads all its content'

    const client = (req as any).supabase;
    const { id } = req.params;

    const title = typeof req.query.search === 'string' ? req.query.search : "";

    // Convert "1,4" into [1, 4]
    const labelIds = typeof req.query.labels === 'string'
        ? req.query.labels.split(',').map(Number).filter(n => !isNaN(n))
        : [];


    const sortQuery = typeof req.query.sort === "string" ? req.query.sort : undefined;
    let sort: SortFilter | undefined = undefined;

    if (sortQuery) {
        sort = {
            column: sortQuery ?? "",
            ascending: true,
        }
    }

    const board = await getBoardById(client, Number(id), title, labelIds, sort);

    res.status(StatusCodes.OK).json(success("Board fetched successfully", board));
}


export const putBoards = async (req: Request, res: Response) => {
    // #swagger.tags = ['Board']
    // #swagger.summary = 'Update board metadata'

    const supabase = (req as any).supabase;
    const { id } = req.params;
    const boardId = Number(id);

    const old = await getBoardById(supabase, boardId);

    const { user_id, description, title } = req.body;

    const request: UpdateBoardDTO = {
        id: old.id,
        user_id: user_id ?? old.user_id,
        description: description ?? old.description,
        title: title ?? old.title,
    };

    const b = await updateBoard(supabase, request);

    res.status(StatusCodes.OK).json(success("Board updated successfully", b));
}


export const deleteBoards = async (req: Request, res: Response) => {
    // #swagger.tags = ['Board']
    // #swagger.summary = 'Delete a board'

    const supabase = (req as any).supabase;
    const { id } = req.params;
    const boardId = Number(id);

    await getBoardById(supabase, boardId);

    const b = await deleteBoard(supabase, boardId);

    res.status(StatusCodes.OK).json(success("Board deleted successfully", b));
}

