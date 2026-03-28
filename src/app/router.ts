// import { Router } from "express";

// // import { authRouter } from "@/modules/auth/auth.router";
// // import { messageRouter } from "@/modules/message/message.router";

// export const router = Router();

// // router.use("/auth", authRouter);
// // router.use("/messages", messageRouter);

import { Router } from "express";

export const router = Router();

router.get("/error-test", (_req, _res) => {
  throw new Error("Test error");
});