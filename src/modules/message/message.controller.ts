import { NextFunction, Request, Response } from "express";
import { TelegramProvider } from "./providers/telegram.provider";
import { MessageService } from "./message.service";

const messageService = new MessageService();

type TelegramReplyMarkup = {
  inline_keyboard: {
    text: string;
    url?: string;
    callback_data?: string;
  }[][];
};

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
      let replyMarkup: TelegramReplyMarkup | undefined = undefined;

      if (!result.isLinkedUser) {
        const publicBaseUrl = process.env.PUBLIC_BASE_URL;

        if (!publicBaseUrl) {
          throw new Error("PUBLIC_BASE_URL is not configured");
        }

        const telegramUsername =
          req.body?.message?.from?.username ||
          req.body?.message?.from?.first_name ||
          "";

        const onboardingUrl =
          `${publicBaseUrl}/onboarding.html` +
          `?platform=telegram` +
          `&telegramUserId=${encodeURIComponent(normalizedMessage.externalUserId ?? "")}` +
          `&telegramUsername=${encodeURIComponent(telegramUsername)}`;

        replyText =
          "Your Telegram account is not linked yet.\n\nConnect your account first:";

        replyMarkup = {
          inline_keyboard: [
            [
              {
                text: "🔗 Connect Account",
                url: onboardingUrl,
              },
            ],
          ],
        };
      }

      await messageService.sendTextMessage({
        platform: normalizedMessage.platform,
        chatId: normalizedMessage.chatId,
        text: replyText,
        userId: result.channelIdentity?.userId ?? null,
        channelIdentityId: result.channelIdentity?.id ?? null,
        replyMarkup,
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