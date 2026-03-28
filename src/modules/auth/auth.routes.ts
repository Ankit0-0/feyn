import { NextFunction, Request, Response, Router } from "express";

import { validateRequest } from "../../shared/middleware/validate-request";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { signinSchema, signupSchema } from "./auth.schemas";

const router = Router();

const authController = new AuthController();
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

router.post(
  "/signup",
  validateRequest(signupSchema),
  authController.signup.bind(authController),
);

router.post(
  "/signin",
  validateRequest(signinSchema),
  authController.signin.bind(authController),
);

router.get("/me", requireAuth, authController.me.bind(authController));

export default router;
