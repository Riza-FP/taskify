import rateLimit from "express-rate-limit";

export const limiterMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
});
