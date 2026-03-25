import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
    email: z.string().email("Invalid email address").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
    otp: z
      .string()
      .length(6, "OTP must be 6 digits")
      .regex(/^\d+$/, "OTP must be numeric"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type SendOtpInput = z.infer<typeof sendOtpSchema>["body"];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>["body"];
