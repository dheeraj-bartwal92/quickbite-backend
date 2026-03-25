import type { Request } from "express";
import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import Session from "./session.schema";

export const getValidSession = async (refreshToken: string) => {
  if (!refreshToken) throw new ApiError(401, "Refresh token is required.");

  const session = await Session.findOne({ refreshToken, isRevoked: false });

  if (!session) throw new ApiError(401, "Invalid or expired session");

  if (session.expireAt < new Date()) {
    await Session.findByIdAndDelete(session._id);
    throw new ApiError(401, "Session expired, please login again");
  }

  return session;
};

export const verifyTokenWithFallback = (token: string, userId: string) => {
  try {
    return verifyRefreshToken(token);
  } catch {
    revokeAllUserSessions(userId);
    throw new ApiError(401, "Token tampered. All sessions revoked.");
  }
};

const revokeAllUserSessions = async (userId: string) => {
  await Session.updateMany({ userId }, { isRevoked: true });
};

export const rotateSession = async (
  oldSessionId: Types.ObjectId,
  userId: Types.ObjectId,
  role: string,
  req: Request,
): Promise<{ accessToken: string; refreshToken: string }> => {
  await Session.findByIdAndDelete(oldSessionId);
  const tokens = await createSession(userId, role, req);
  return tokens;
};

const extractDeviceInfo = (req: Request) => {
  const ua = req.headers["user-agent"] || "";

  return {
    deviceType: /mobile/i.test(ua) ? "mobile" : "desktop",
    userAgent: ua.substring(0, 200),
    ip: req.ip || "",
  };
};

export const createSession = async (
  userId: Types.ObjectId,
  role: string,
  req: Request,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);

  const deviceInfo = extractDeviceInfo(req);

  await Session.create({
    userId,
    refreshToken,
    deviceInfo,
    expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};
