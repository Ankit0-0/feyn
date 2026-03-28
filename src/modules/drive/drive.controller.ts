import { Request, Response, NextFunction } from "express";
import multer from "multer";

import { DriveService } from "./drive.service";

const driveService = new DriveService();

export class DriveController {
  async connect(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;

      const authUrl = driveService.getGoogleAuthUrl(userId);

      res.status(200).json({
        success: true,
        data: {
          authUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async callback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;

      if (!code || !state) {
        throw new Error("Missing code or state");
      }

      const result = await driveService.handleGoogleCallback(code, state);

      req.log.info(
        {
          userId: (result as any).userId,
          googleAccountId: result.googleAccountId,
        },
        "Google Drive connected",
      );

      // for now just return JSON
      // later you can redirect to frontend
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async files(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;

      const files = await driveService.listFiles(userId);

      res.status(200).json({
        success: true,
        data: files,
      });
    } catch (error) {
      next(error);
    }
  }

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;

      const file = req.file as
        | { originalname: string; mimetype: string; buffer: Buffer }
        | undefined;

      if (!file) {
        throw new Error("File is required");
      }

      const result = await driveService.uploadFile(userId, file);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;

      const fileId = req.params.fileId;

      if (!fileId || Array.isArray(fileId)) {
        throw new Error("Invalid fileId");
      }

      const result = await driveService.downloadFile(userId, fileId);

      res.setHeader("Content-Type", result.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.fileName}"`,
      );

      res.status(200).send(result.data);
    } catch (error) {
      next(error);
    }
  }
}
