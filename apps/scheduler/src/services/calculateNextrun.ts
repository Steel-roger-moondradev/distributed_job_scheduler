import { CronExpressionParser } from "cron-parser";

type JobType = "CRON" | "ONCE" | "DELAYED";

interface CalculateNextRunParams {
  type: JobType;
  cronExpression: string | null;
  currentTime?: Date;
}

export function calculateNextRun({
  type,
  cronExpression,
  currentTime = new Date(),
}: CalculateNextRunParams): Date | null {
  if (type === "CRON") {
    if (!cronExpression) {
      throw new Error("CRON job requires a cronExpression");
    }

    const expression = CronExpressionParser.parse(cronExpression, {
      currentDate: currentTime,
    });

    return expression.next().toDate();
  }

  // ONCE and DELAYED jobs run only once.
  return null;
}
