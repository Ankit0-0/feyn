import express, { type Application } from "express";
import helmet from "helmet";
import { httpLogger } from "../shared/middleware/request-logger";

import router  from "./router";
import { notFoundHandler } from "../shared/middleware/not-found";
import { errorHandler } from "../shared/middleware/error-handler";

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(httpLogger); // turn on to show request logs
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "feyn",
    });
  });

  app.use("/api/v1", router);
  app.get("/", (_, res) => {
    res.status(200).json({
      status: "ok",
      message: "feyn",
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
