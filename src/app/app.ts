import express, { type Application } from "express";
import helmet from "helmet";

import { router } from "./router";

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "feyn-core-server",
    });
  });

  app.use("/api", router);

  return app;
};