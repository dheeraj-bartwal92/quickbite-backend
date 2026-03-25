import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new ApiError(
        429,
        "Too many attempts. Please try again after 15 minutes.",
      ),
    );
  },
});

// OTP limiter — stricter, prevents OTP spam
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // max 3 OTP requests per minute
  handler: (_req, _res, next) => {
    next(new ApiError(429, "Too many OTP requests. Please wait 1 minute."));
  },
});
