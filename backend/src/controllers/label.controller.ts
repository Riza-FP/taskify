import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { success } from "../utils/response.js";
import { createLabel, deleteLabel, getAllLabelByTaskId, getLabelById, searchLabelByTitle, updateLabel } from "../services/label.service.js";
import type { UpdateLabelDTO } from "../types/label.type.js";

export const postLabels = async (req: Request, res: Response) => {
    const supabase = (req as any).supabase;
    const label = await createLabel(supabase, req.body);
    res.status(StatusCodes.CREATED).json(success("Label created successfully", label));
}

export const putLabels = async (req: Request, res: Response) => {
    const supabase = (req as any).supabase;

    const { id } = req.params;
    const labelId = Number(id);
    const old = await getLabelById(supabase, labelId);
    const { task_id, color, title } = req.body;

    const request: UpdateLabelDTO = {
        id: old.id,
        task_id: task_id ?? old.task_id,
        color: color ?? old.color,
        title: title ?? old.title,
    };

    const task = await updateLabel(supabase, request);
    res.status(StatusCodes.OK).json(success("Task updated successfully", task));
}

export const deleteLabels = async (req: Request, res: Response) => {
    const supabase = (req as any).supabase;
    const { id } = req.params;
    const labelId = Number(id);

    await getLabelById(supabase, labelId);
    const label = await deleteLabel(supabase, labelId);
    res.status(StatusCodes.OK).json(success("Label deleted successfully", label));
}


export const getLabelsByTaskId = async (req: Request, res: Response) => {
    const supabase = (req as any).supabase;
    const { id } = req.params;
    const taskId = Number(id);

    const labels = await getAllLabelByTaskId(supabase, taskId);
    res.status(StatusCodes.OK).json(success("Labels fetched successfully", labels));
}

export const searchLabels = async (req: Request, res: Response) => {
    const supabase = (req as any).supabase;
    const query = req.query.search;
    const taskId = req.query.taskId ? Number(req.query.taskId) : null;
    const boardId = req.query.boardId ? Number(req.query.boardId) : null;

    const labels = await searchLabelByTitle(supabase, query as string, taskId, boardId);
    res.status(StatusCodes.OK).json(success("Labels fetched successfully", labels));
}

