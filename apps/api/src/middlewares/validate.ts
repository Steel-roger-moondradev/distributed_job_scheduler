import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate(
  schema: z.ZodSchema,
  source: "body" | "params" | "query" = "body",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.flatten(),
      });
    }

    req[source] = result.data;

    next();
  };
}
