import { NextFunction, Request, Response } from "express";
import { TelegramProvider } from "./providers/telegram.provider";
import { MessageService } from "./message.service";

const messageService = new MessageService();

export class MessageController {
  static async handleTelegramWebhook(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const normalizedMessage = TelegramProvider.parseIncoming(req.body);

      if (!normalizedMessage) {
        req.log.warn({ body: req.body }, "Unsupported telegram update");

        return res.status(200).json({
          success: true,
          message: "Ignored unsupported telegram update",
        });
      }

      const result = await messageService.ingestIncomingMessage(
        normalizedMessage,
      );

      req.log.info(
        {
          messageId: result.message.id,
          platform: result.message.platform,
          type: result.message.type,
          isLinkedUser: result.isLinkedUser,
        },
        "Inbound telegram message stored",
      );

      let replyText = "Message received.";

      if (!result.isLinkedUser) {
        replyText = "Your Telegram account is not linked yet. Please sign in and connect your account first.";
      }

      await messageService.sendTextMessage({
        platform: normalizedMessage.platform,
        chatId: normalizedMessage.chatId,
        text: replyText,
        userId: result.channelIdentity?.userId ?? null,
        channelIdentityId: result.channelIdentity?.id ?? null,
      });

      req.log.info(
        {
          platform: normalizedMessage.platform,
          chatId: normalizedMessage.chatId,
          isLinkedUser: result.isLinkedUser,
        },
        "Outbound telegram reply sent",
      );

      return res.status(200).json({
        success: true,
        message: "Telegram webhook processed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}