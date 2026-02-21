import type { Request, Response } from "express";
import { createList, deleteList, getAllListByBoardId, getListById, updateList } from "../services/list.service.js";
import { StatusCodes } from "http-status-codes";
import { success } from "../utils/response.js";
import type { UpdateListDTO } from "../types/list.type.js";

export const postLists = async (req: Request, res: Response) => {
    // #swagger.tags = ['List']
    // #swagger.summary = 'Create new list'
    const supabase = (req as any).supabase;
    const { title, board_id, position } = req.body;

    const list = await createList(supabase,
        {
            title,
            board_id,
            position,
        });

    res.status(StatusCodes.CREATED).json(success("List created successfully", list));
}


export const getLists = async (req: Request, res: Response) => {
    // #swagger.tags = ['List']
    // #swagger.summary = 'Get lists for a board'
    const supabase = (req as any).supabase;
    const { id } = req.params;

    const lists = await getAllListByBoardId(supabase, Number(id));

    res.status(StatusCodes.OK).json(success("Lists fetched successfully", lists));
}


export const putLists = async (req: Request, res: Response) => {
    // #swagger.tags = ['List']
    // #swagger.summary = 'Update a list'
    const supabase = (req as any).supabase;
    const { id } = req.params;
    const listId = Number(id);

    const old = await getListById(supabase, listId);

    const { board_id, position, title } = req.body;

    const request: UpdateListDTO = {
        id: old.id,
        board_id: board_id ?? old.board_id,
        position: position ?? old.position,
        title: title ?? old.title,
    };

    const task = await updateList(supabase, request);

    res.status(StatusCodes.OK).json(success("List updated successfully", task));
}


export const deleteLists = async (req: Request, res: Response) => {
    // #swagger.tags = ['List']
    // #swagger.summary = 'Delete a list'
    const supabase = (req as any).supabase;
    const { id } = req.params;
    const listId = Number(id);

    await getListById(supabase, listId);

    const list = await deleteList(supabase, listId);

    res.status(StatusCodes.OK).json(success("List deleted successfully", list));
}

