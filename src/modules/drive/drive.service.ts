import { google } from "googleapis";
// import type { File as MulterFile } from "multer";
import { env } from "../../config/env";
import { prisma } from "../../shared/prisma/prisma";
import { Readable } from "stream";

import type { UploadedFile } from "./drive.types";

export class DriveService {
  private oauth2Client() {
    return new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI,
    );
  }

  getGoogleAuthUrl(userId: string) {
    const client = this.oauth2Client();

    const state = Buffer.from(JSON.stringify({ userId }), "utf-8").toString(
      "base64",
    );

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/drive",
      ],
      state,
    });

    return authUrl;
  }

  async handleGoogleCallback(code: string, state: string) {
    const decodedState = JSON.parse(
      Buffer.from(state, "base64").toString("utf-8"),
    ) as { userId: string };

    const userId = decodedState.userId;

    const client = this.oauth2Client();

    const { tokens } = await client.getToken(code);

    client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: client,
      version: "v2",
    });

    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser.id) {
      throw new Error("Google account id not found");
    }

    await prisma.driveConnection.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: googleUser.id,
        },
      },
      update: {
        userId,
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token || "",
        expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      create: {
        userId,
        provider: "google",
        providerAccountId: googleUser.id,
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token || "",
        expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    return {
      success: true,
      googleAccountId: googleUser.id,
      email: googleUser.email,
    };
  }

  async listFiles(userId: string) {
    const connection = await prisma.driveConnection.findFirst({
      where: {
        userId,
        provider: "google",
      },
    });

    if (!connection) {
      throw new Error("Google Drive not connected");
    }

    const client = this.oauth2Client();

    client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken || undefined,
      expiry_date: connection.expiry ? connection.expiry.getTime() : undefined,
    });

    const drive = google.drive({
      version: "v3",
      auth: client,
    });

    const response = await drive.files.list({
      pageSize: 20,
      fields: "files(id, name, mimeType, parents, modifiedTime)",
    });

    return response.data.files || [];
  }

  async uploadFile(userId: string, file: UploadedFile) {
    const connection = await prisma.driveConnection.findFirst({
      where: {
        userId,
        provider: "google",
      },
    });

    if (!connection) {
      throw new Error("Google Drive not connected");
    }

    const client = this.oauth2Client();

    client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken || undefined,
      expiry_date: connection.expiry ? connection.expiry.getTime() : undefined,
    });

    const drive = google.drive({
      version: "v3",
      auth: client,
    });

    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
      },
      media: {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      },
      fields: "id, name, mimeType",
    });

    return response.data;
  }

  async downloadFile(userId: string, fileId: string) {
    const connection = await prisma.driveConnection.findFirst({
      where: {
        userId,
        provider: "google",
      },
    });

    if (!connection) {
      throw new Error("Google Drive not connected");
    }

    const client = this.oauth2Client();

    client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken || undefined,
      expiry_date: connection.expiry ? connection.expiry.getTime() : undefined,
    });

    const drive = google.drive({
      version: "v3",
      auth: client,
    });

    const metadataResponse = await drive.files.get({
      fileId,
      fields: "id, name, mimeType",
    });

    const fileMetadata = metadataResponse.data;

    const fileResponse = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      {
        responseType: "arraybuffer",
      },
    );

    return {
      fileName: fileMetadata.name || "downloaded-file",
      mimeType: fileMetadata.mimeType || "application/octet-stream",
      data: Buffer.from(fileResponse.data as ArrayBuffer),
    };
  }
}
