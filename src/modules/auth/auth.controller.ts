import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { env } from "../../config/env";
import { loginService, registerService } from "./auth.service";
import * as authService from "./auth.service";
import { isMobileClient } from "../../utils/request.utils";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, email, password } = req.body;

  const result = await registerService(name, phone, email, password, req);

  const isMobile = isMobileClient(req);

  if (!isMobile) {
    res.cookie("refreshToken", result.refreshToken, cookieOptions);
  }

  res.status(201).json(
    new ApiResponse(201, "Account created successfully", {
      user: result.user,
      accessToken: result.accessToken,
      ...(isMobile && { refreshToken: result.refreshToken }),
    }),
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await loginService(email, password, req);

  const isMobile = isMobileClient(req);

  if (!isMobile) {
    res.cookie("refreshToken", result.refreshToken, cookieOptions);
  }

  res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user: result.user,
      accessToken: result.accessToken,
      ...(isMobile && { refreshToken: result.refreshToken }),
    }),
  );
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    // Get refresh token from httpOnly cookie (preferred) or body (for mobile)
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const result = await authService.refreshTokenService(token, req);

    const isMobile = isMobileClient(req);

    if (!isMobile) {
      res.cookie("refreshToken", result.refreshToken, cookieOptions);
    }

    res.json(
      new ApiResponse(200, "Token refreshed", {
        accessToken: result.accessToken,
        ...(isMobile && { refreshToken: result.refreshToken }),
      }),
    );
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  await authService.logoutService(token);

  res
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, "Logged out successfully"));
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAllService(req.user!.userId);

  res
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, "Logged out from all devices"));
});
