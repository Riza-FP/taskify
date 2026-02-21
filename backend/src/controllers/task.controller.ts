import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { success } from "../utils/response.js";
import { createTask, deleteTask, getAllTaskByListId, getTaskById, updateTask } from "../services/task.service.js";
import type { UpdateTaskDTO } from "../types/task.type.js";
import type { SortFilter } from "../types/filter.type.js";

export const postTasks = async (req: Request, res: Response) => {
    // #swagger.tags = ['Task']
    // #swagger.summary = 'Create new task'
    const supabase = (req as any).supabase;

    const task = await createTask(supabase, req.body);

    res.status(StatusCodes.CREATED).json(success("Task created successfully", task));
}

export const putTasks = async (req: Request, res: Response) => {
    // #swagger.tags = ['Task']
    // #swagger.summary = 'Update a task'
    const supabase = (req as any).supabase;

    const { id } = req.params;

    const taskId = Number(id);

    const old = await getTaskById(supabase, taskId);

    const { list_id, rank, title, description, deadline } = req.body;

    const request: UpdateTaskDTO = {
        id: old.id,
        list_id: list_id ?? old.list_id,
        rank: rank ?? old.position,
        title: title ?? old.title,
        description: description,
        deadline: deadline,
    };

    const task = await updateTask(supabase, request);

    res.status(StatusCodes.OK).json(success("Task updated successfully", task));
}


export const deleteTasks = async (req: Request, res: Response) => {
    // #swagger.tags = ['Task']
    // #swagger.summary = 'Delete task'
    const supabase = (req as any).supabase;
    const { id } = req.params;
    const taskId = Number(id);

    await getTaskById(supabase, taskId);

    const task = await deleteTask(supabase, taskId);

    res.status(StatusCodes.OK).json(success("Task deleted successfully", task));
}



export const getTasksForList = async (req: Request, res: Response) => {
    // #swagger.tags = ['Task']
    // #swagger.summary = 'Get tasks for a list. Optional sortings available'
    const supabase = (req as any).supabase;
    const { id } = req.params;
    const listId = Number(id);

    const sortQuery = typeof req.query.sort === "string" ? req.query.sort.split(":") : undefined;
    let sort: SortFilter | undefined = undefined;

    if (sortQuery) {
        sort = {
            column: sortQuery[0] ?? "",
            ascending: sortQuery[1] === "asc" ? true : false,
        }
    }

    const tasks = await getAllTaskByListId(supabase, listId, sort);

    res.status(StatusCodes.OK).json(success("Tasks fetched successfully", tasks));
}

