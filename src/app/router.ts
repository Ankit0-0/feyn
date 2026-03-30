import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import driveRoutes from "../modules/drive/drive.routes";
import messageRoutes from "../modules/message/message.routes";

const router = Router();

router.use("/messages", messageRoutes);
router.use("/auth", authRoutes);
router.use("/drive", driveRoutes);

export default router;