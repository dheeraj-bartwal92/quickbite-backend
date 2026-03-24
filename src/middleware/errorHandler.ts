import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { env } from "../config/env";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res
      .status(err.statusCode)
      .json(
        new ApiResponse(err.statusCode, err.message, { errors: err.errors }),
      );

    return;
  }

  // Mongoose duplicate key error (e.g. duplicate email)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    res.status(409).json(new ApiResponse(409, `${field} already exists`));
    return;
  }

  // Unknown error — don't leak details in production
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json(
      new ApiResponse(
        500,
        env.NODE_ENV === "development" ? err.message : "Internal server error",
      ),
    );
};
