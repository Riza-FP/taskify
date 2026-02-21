import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import routes from "./routes/index.route.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { corsMiddleware } from "./middlewares/cors.js";
import { limiterMiddleware } from "./middlewares/rate-limit.js";

import swaggerUi from 'swagger-ui-express';
import swaggerFile from '../swagger-output.json' with { type: 'json' };

const __dirname = new URL(".", import.meta.url).pathname;

export function createApp() {
    const app = express();

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

    app.use(
        "/static",
        express.static(path.join(__dirname, "public"))
    );

    app.use(cookieParser());
    app.use(corsMiddleware);
    app.use(limiterMiddleware);

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.use("/api/v1", routes);

    app.use(errorHandler);

    return app;
}
