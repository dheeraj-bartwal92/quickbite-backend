import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/jwt";
import User from "../modules/auth/auth.schema";

// Type Augmentation for express Request type

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer", "");

    if (!token) {
      throw new ApiError(401, "Access token required");
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId)
      .select("isActive role")
      .lean();

    if (!user || !user.isActive) {
      throw new ApiError(401, "User not found or deactivated");
    }

    req.user = { userId: payload.userId, role: user.role };
    next();
  } catch (error: unknown) {
    if (error instanceof ApiError) return next(error);

    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        return next(new ApiError(401, "Access token expired"));
      }
      if (error.name === "JsonWebTokenError") {
        return next(new ApiError(401, "Invalid access token"));
      }
    }
    next(new ApiError(401, "Authentication failed"));
  }
};
