import { prisma } from "../../shared/prisma/prisma";
import { TelegramProvider } from "./providers/telegram.provider";
import { NormalizedIncomingMessage, Platform } from "./message.types";

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
      isLinkedUser: Boolean(channelIdentity),
    };
  }

  async sendTextMessage({
    platform,
    chatId,
    text,
    userId,
    channelIdentityId,
  }: {
    platform: Platform;
    chatId: string;
    text: string;
    userId?: string | null;
    channelIdentityId?: string | null;
  }) {
    if (platform === "telegram") {
      await TelegramProvider.sendMessage(chatId, text);
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
        rawPayload: {},
      },
    });

    return outboundMessage;
  }
}
