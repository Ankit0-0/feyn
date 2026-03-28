import { Request, Response, NextFunction } from "express";

import { AuthService } from "./auth.service";

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);

      req.log.info({ userId: result.user.id }, "User signed up");

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signin(req.body);

      req.log.info({ userId: result.user.id }, "User signed in");

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      // we will attach this via middleware later
      const userId = (req as any).userId;

      const user = await authService.getMe(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
