import "dotenv/config";

import { createServer, type Server as HttpServer } from "node:http";

import { createApp } from "./app";
import { createLogger } from "../shared/logger/logger";
const log = createLogger({ module: "app" });

const PORT = Number(process.env.PORT) || 4000;

const app = createApp();
const server: HttpServer = createServer(app);

server.listen(PORT, () => {
  log.info({ port: PORT }, `Server started at http://localhost:${PORT}`);
});