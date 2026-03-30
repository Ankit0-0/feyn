import axios from "axios";
import { NormalizedIncomingMessage } from "../message.types";

export class TelegramProvider {
  static parseIncoming(update: any): NormalizedIncomingMessage | null {
    const message = update?.message;

    if (!message) {
      return null;
    }

    const from = message.from;
    const chat = message.chat;

    if (!from?.id || !chat?.id) {
      return null;
    }

    if (message.text) {
      return {
        platform: "telegram",
        direction: "inbound",
        externalMessageId: String(message.message_id),
        externalUserId: String(from.id),
        chatId: String(chat.id),
        type: "text",
        textContent: message.text,
        rawPayload: update,
      };
    }

    if (message.document) {
      return {
        platform: "telegram",
        direction: "inbound",
        externalMessageId: String(message.message_id),
        externalUserId: String(from.id),
        chatId: String(chat.id),
        type: "document",
        textContent: message.caption,
        rawPayload: update,
        attachments: [
          {
            platformFileId: message.document.file_id,
            fileName: message.document.file_name,
            mimeType: message.document.mime_type,
            fileSize: message.document.file_size,
          },
        ],
      };
    }

    return null;
  }

  static async sendMessage(chatId: string, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await axios.post(url, {
      chat_id: chatId,
      text,
    });

    return response.data;
  }
}
