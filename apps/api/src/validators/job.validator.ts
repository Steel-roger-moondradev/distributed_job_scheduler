import { z } from "zod";

console.log("create route hit");
export const createJobSchema = z.object({
  name: z.string().min(1, "Name is required"),

  description: z.string().optional(),

  payload: z.unknown(),

  type: z.string().min(1, "Type is required"),

  cronExpression: z.string().optional(),

  active: z.boolean().optional(),

  priority: z.number().int().nonnegative().optional(),

  nextRunAt: z.string().datetime().optional(),

  maxRetries: z.number().int().nonnegative().optional(),

  timeoutMs: z.number().int().positive().optional(),
});
