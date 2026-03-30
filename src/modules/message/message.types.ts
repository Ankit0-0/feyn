export type Platform = "telegram" | "whatsapp";
export type MessageDirection = "inbound" | "outbound";
export type MessageType = "text" | "audio" | "image" | "document";

export interface NormalizedAttachment {
  platformFileId?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}

export interface NormalizedIncomingMessage {
  platform: Platform;
  direction: "inbound";
  externalMessageId?: string;
  externalUserId: string;
  chatId: string;
  type: MessageType;
  textContent?: string;
  rawPayload: unknown;
  attachments?: NormalizedAttachment[];
}