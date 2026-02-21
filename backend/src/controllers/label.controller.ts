import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { success } from "../utils/response.js";
import { createLabel, deleteLabel, getAllLabel, getLabelById, updateLabel } from "../services/label.service.js";
import { createLabelToTask, deleteLabelToTask, selectTaskLabel } from "../services/task-label.service.js";

export const getLabels = async (req: Request, res: Response) => {
    // #swagger.tags = ['Label']
    // #swagger.summary = 'Get all labels, optional title filter'
    const supabase = (req as any).supabase;
    const query = req.query.search ?? null;

    const labels = await getAllLabel(supabase, query as string | null);
    res.status(StatusCodes.OK).json(success("Labels fetched successfully", labels));
}

export const deleteLabels = async (req: Request, res: Response) => {
    // #swagger.tags = ['Label']
    // #swagger.summary = 'Delete a label by ID'

    const supabase = (req as any).supabase;

    const { id } = req.params;
    const labelId = Number(id);

    const label = await deleteLabel(supabase, labelId);
    res.status(StatusCodes.OK).json(success("Label deleted successfully", label));
}

export const putLabels = async (req: Request, res: Response) => {
    // #swagger.tags = ['Label']
    // #swagger.summary = 'Update a label'

    const { title, color } = req.body;
    const supabase = (req as any).supabase;

    const { id } = req.params;
    const labelId = Number(id);

    const old = await getLabelById(supabase, labelId);
    old.title = title ?? old.title;
    old.color = color ?? old.color;

    const label = await updateLabel(supabase, old);
    res.status(StatusCodes.OK).json(success("Label updated successfully", label));
}

export const postLabels = async (req: Request, res: Response) => {
    // #swagger.tags = ['Label']
    // #swagger.summary = 'Create new label, needs to assign to a task'
    const { title, color, taskId } = req.body;
    const supabase = (req as any).supabase;

    const label = await createLabel(supabase, { title, color });
    await createLabelToTask(supabase, Number(taskId), label.id)
    res.status(StatusCodes.CREATED).json(success("Label successfully created", label));
}

export const toggleLabels = async (req: Request, res: Response) => {
    // #swagger.tags = ['Label']
    // #swagger.summary = 'Assign or unassign label to a task'
    const { taskId, labelId } = req.body;
    const supabase = (req as any).supabase;

    const exists = await selectTaskLabel(supabase, taskId, labelId);

    if (exists) {
        await deleteLabelToTask(supabase, taskId, labelId);
    } else {
        await createLabelToTask(supabase, taskId, labelId);
    }

    res.status(StatusCodes.OK).json(success("Label toggled successfully"));
}

