/* istanbul ignore fil */
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
});

export const config = {
    port: process.env.PORT ?? 8080,
    host: process.env.HOST ?? "http://localhost",
    frontend_url: process.env.FRONTEND_URL ?? "http://localhost:5173",
    db: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    redis: {
        url: process.env.REDIS_URL ?? "redis://localhost:6379",
    },
    supabase: {
        site_url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    }
};
