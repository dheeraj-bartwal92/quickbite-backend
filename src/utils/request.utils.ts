import { Request } from "express";

export const isMobileClient = (req: Request): boolean => {
  return req.headers["x-client-type"] === "mobile";
};
