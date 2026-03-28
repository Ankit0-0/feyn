import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // default values
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // log the error (use req.log from pino-http)
  req.log?.error(
    {
      err,
      path: req.originalUrl,
      method: req.method,
    },
    "Unhandled error"
  );

  res.status(statusCode).json({
    success: false,
    message,
  });
};