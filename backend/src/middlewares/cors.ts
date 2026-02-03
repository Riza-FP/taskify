import cors from "cors";
import { config } from "../utils/config.js";

export const corsMiddleware = cors({
    origin: [`${config.host}:${config.port}`, config.frontend_url],
    credentials: true,
    optionsSuccessStatus: 200,
});
