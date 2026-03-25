import type { Request } from "express";
import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import User from "./auth.schema";
import Session from "./session.schema";
import {
  createSession,
  getValidSession,
  rotateSession,
  verifyTokenWithFallback,
} from "./session.service";

export const registerService = async (
  name: string,
  phone: string,
  email: string,
  password: string,
  req: Request,
) => {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phone.trim();

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
  });
  if (existingUser) throw new ApiError(409, "Email already registered");

  const user = await User.create({
    name,
    email: normalizedEmail,
    phone: normalizedPhone,
    passwordHash: password,
    role: "customer",
  });

  const tokens = await createSession(user._id, user.role, req);

  return { user: user.toSafeObject(), ...tokens };
};

export const loginService = async (
  email: string,
  password: string,
  req: Request,
) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+passwordHash",
  );

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const tokens = await createSession(user._id, user.role, req);

  return {
    user: user.toSafeObject(),
    ...tokens,
  };
};

export const refreshTokenService = async (
  refreshToken: string,
  req: Request,
): Promise<{ accessToken: string; refreshToken: string }> => {
  if (!refreshToken) throw new ApiError(401, "Refresh token required");

  const session = await getValidSession(refreshToken);

  const payload = verifyTokenWithFallback(
    refreshToken,
    session.userId.toString(),
  );

  const user = await getActiveUser(payload.userId);

  return await rotateSession(session._id, user._id, user.role, req);
};

const getActiveUser = async (userId: string) => {
  const user = await User.findById(userId).select("role isActive");

  if (!user || !user.isActive) {
    throw new ApiError(401, "User not found");
  }

  return user;
};

export const logoutService = async (refreshToken: string): Promise<void> => {
  if (!refreshToken) throw new ApiError(400, "Refresh token required");

  await Session.findOneAndDelete({ refreshToken });
};

export const logoutAllService = async (userId: string): Promise<void> => {
  await Session.deleteMany({ userId: new Types.ObjectId(userId) });
};
