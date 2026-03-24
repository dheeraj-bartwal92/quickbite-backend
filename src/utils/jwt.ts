import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Types } from "mongoose";

export interface TokenPayload {
  userId: string;
  role: string;
  type: "access" | "refresh";
}

export const generateAccessToken = (
  userId: Types.ObjectId,
  role: string,
): string => {
  const payload: TokenPayload = {
    userId: userId.toString(),
    role,
    type: "access",
  };
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  } as SignOptions);
};

export const generateRefreshToken = (
  userId: Types.ObjectId,
  role: string,
): string => {
  const payload: TokenPayload = {
    userId: userId.toString(),
    role,
    type: "refresh",
  };
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
};
