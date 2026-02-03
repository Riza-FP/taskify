import { config } from "./utils/config.js";
// import { initRedis } from "./lib/redis/redis.js";
import { createHttpServer } from "./server.js";

async function bootstrap() {
    // await initRedis();
    const server = createHttpServer();

    server.listen(config.port, () => {
        console.log(
            `Taskify backend service is running on ${config.host}:${config.port}...`
        );
    });
}

bootstrap();
