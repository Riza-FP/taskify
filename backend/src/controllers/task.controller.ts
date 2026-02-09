import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { success } from "../utils/response.js";
import { createTask, deleteTask, getAllTaskByListId, getTaskById, updateTask } from "../services/task.service.js";
import type { UpdateTaskDTO } from "../types/task.type.js";

export const postTasks = async (req: Request, res: Response) => {
    const supabase = (req as any).supabase;

    const task = await createTask(supabase, req.body);

    res.status(StatusCodes.CREATED).json(success("Task created successfully", task));
}

export const putTasks = async (req: Request, res: Response) => {
    const supabase = (req as any).supabase;
    const { id } = req.params;

    const taskId = Number(id);

    const old = await getTaskById(supabase, taskId);

    const { list_id, rank, title, description, deadline } = req.body;

    console.log("RANK FROM BDOY", rank);

    const request: UpdateTaskDTO = {
        id: old.id,
        list_id: list_id ?? old.list_id,
        rank: rank ?? old.rank,
        title: title ?? old.title,
        description: description,
        deadline: deadline,
    };

    console.log("RANK BEFORE REQUEST", rank);


    const task = await updateTask(supabase, request);

    console.log("RANK AFTER DB", rank);


    res.status(StatusCodes.OK).json(success("Task updated successfully", task));
}


export const deleteTasks = async (req: Request, res: Response) => {

    const supabase = (req as any).supabase;
    const { id } = req.params;
    const taskId = Number(id);

    await getTaskById(supabase, taskId);

    const task = await deleteTask(supabase, taskId);

    res.status(StatusCodes.OK).json(success("Task deleted successfully", task));
}



export const getTasks = async (req: Request, res: Response) => {
    const supabase = (req as any).supabase;
    const { id } = req.params;
    const listId = Number(id);

    const tasks = await getAllTaskByListId(supabase, listId);

    res.status(StatusCodes.OK).json(success("Tasks fetched successfully", tasks));
}
