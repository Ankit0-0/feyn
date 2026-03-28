import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";

import { DriveController } from "./drive.controller";
import { AuthService } from "../../modules/auth/auth.service";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

const driveController = new DriveController();
const authService = new AuthService();

function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    const payload = authService.verifyToken(token) as {
      userId: string;
      email: string;
    };

    (req as any).userId = payload.userId;
    (req as any).email = payload.email;

    next();
  } catch (error) {
    next(error);
  }
}

router.get(
  "/connect",
  requireAuth,
  driveController.connect.bind(driveController),
);

router.get("/callback", driveController.callback.bind(driveController));

router.get("/files", requireAuth, driveController.files.bind(driveController));

router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  driveController.upload.bind(driveController),
);

router.get(
  "/download/:fileId",
  requireAuth,
  driveController.download.bind(driveController),
);
export default router;
