import { prisma } from "../../shared/prisma/prisma";
import { TelegramProvider } from "./providers/telegram.provider";
import { NormalizedIncomingMessage, Platform } from "./message.types";

type TelegramReplyMarkup = {
  inline_keyboard: {
    text: string;
    url?: string;
    callback_data?: string;
  }[][];
};

export class MessageService {
  async ingestIncomingMessage(payload: NormalizedIncomingMessage) {
    const channelIdentity = await prisma.channelIdentity.findUnique({
      where: {
        platform_externalId: {
          platform: payload.platform,
          externalId: payload.externalUserId,
        },
      },
    });

    const message = await prisma.message.create({
      data: {
        userId: channelIdentity?.userId ?? null,
        channelIdentityId: channelIdentity?.id ?? null,
        platform: payload.platform,
        direction: payload.direction,
        type: payload.type,
        externalUserId: payload.externalUserId,
        externalChatId: payload.chatId,
        externalMessageId: payload.externalMessageId,
        textContent: payload.textContent,
        rawPayload: payload.rawPayload as any,
        attachments:
          payload.attachments && payload.attachments.length > 0
            ? {
                create: payload.attachments.map((attachment) => ({
                  platformFileId: attachment.platformFileId,
                  fileName: attachment.fileName,
                  mimeType: attachment.mimeType,
                  fileSize: attachment.fileSize,
                })),
              }
            : undefined,
      },
      include: {
        attachments: true,
      },
    });

    return {
      message,
      channelIdentity,
      isLinkedUser: Boolean(channelIdentity?.userId),
    };
  }

  async sendTextMessage({
    platform,
    chatId,
    text,
    userId,
    channelIdentityId,
    replyMarkup,
  }: {
    platform: Platform;
    chatId: string;
    text: string;
    userId?: string | null;
    channelIdentityId?: string | null;
    replyMarkup?: TelegramReplyMarkup;
  }) {
    let providerResponse: unknown = {};

    if (platform === "telegram") {
      providerResponse = await TelegramProvider.sendMessage(
        chatId,
        text,
        replyMarkup,
      );
    }

    const outboundMessage = await prisma.message.create({
      data: {
        userId: userId ?? null,
        channelIdentityId: channelIdentityId ?? null,
        platform,
        direction: "outbound",
        type: "text",
        externalChatId: chatId,
        textContent: text,
        rawPayload: providerResponse as any,
      },
    });

    return outboundMessage;
  }
}