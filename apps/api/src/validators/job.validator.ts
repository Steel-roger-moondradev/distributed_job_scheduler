import { z } from "zod";

export const createJobSchema = z.object({
  name: z.string().min(1, "Name is required"),

  description: z.string().optional(),

  payload: z.unknown(),

  type: z.enum(["ONCE", "DELAYED", "CRON"]),

  jobtype: z.enum(["HTTP_REQUEST", "EMAIL"]),

  cronExpression: z.string().optional(),

  priority: z.number().int().nonnegative().optional(),

  delaySeconds: z.number().nonnegative().optional(),

  maxRetries: z.number().int().nonnegative().optional(),

  timeoutMs: z.number().int().positive().optional(),
});
