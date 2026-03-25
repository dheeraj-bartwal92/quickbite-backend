import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate =
  (schema: ZodObject<any>) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      console.log("I am here");

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        next(new ApiError(422, "Validation failed", errors));
      } else {
        next(error);
      }
    }
  };
