import { createServer } from "http";
import { createApp } from "./app.js";
// import { createSocketServer } from "./sockets/server.js";
// import { initSocket } from "./sockets/conn.js";

export function createHttpServer() {
    const app = createApp();
    const httpServer = createServer(app);

    // createSocketServer(httpServer);
    // initSocket();

    return httpServer;
}
