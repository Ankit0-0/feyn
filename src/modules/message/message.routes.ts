import { Router } from "express";
import { MessageController } from "./message.controller";

const router = Router();

router.post("/telegram/webhook", MessageController.handleTelegramWebhook);

export default router;