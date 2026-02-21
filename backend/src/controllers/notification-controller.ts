import type { Request, Response } from "express";
import { selectNotificationSetting, updateNotificationSetting } from "../services/notification.service.js";
import { StatusCodes } from "http-status-codes";
import { success } from "../utils/response.js";

export const putNotificationSettings = async (req: Request, res: Response) => {
    // #swagger.tags = ['Settings']
    // #swagger.summary = 'Set user notification settings'
    const { days } = req.body;
    const supabase = (req as any).supabase;
    const data = await updateNotificationSetting(supabase, Number(days));
    res.status(StatusCodes.OK).json(success("Notification setting updated successfully", data));
}


export const getNotificationSettings = async (req: Request, res: Response) => {
    // #swagger.tags = ['Settings']
    // #swagger.summary = 'Get user current notification settings'
    const supabase = (req as any).supabase;
    const data = await selectNotificationSetting(supabase);
    res.status(StatusCodes.OK).json(success("Notification fetched successfully", data));
}
