import { CronExpressionParser } from "cron-parser";

export function getNextRun(expression: string): Date {
  try {
    const interval = CronExpressionParser.parse(expression);
    return interval.next().toDate();
  } catch (error) {
    throw new Error(
      `Failed to parse cron expression "${expression}": ${String(error)}`,
    );
  }
}
