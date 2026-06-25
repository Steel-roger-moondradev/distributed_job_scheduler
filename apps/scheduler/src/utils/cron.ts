import parser from "cron-parser";

/**
 * Expose getNextRun(expression: string) returning Date.
 * Handled cron parsing errors safely.
 */
export function getNextRun(expression: string): Date {
  try {
    const interval = parser.parseExpression(expression);
    return interval.next().toDate();
  } catch (error) {
    throw new Error(`Failed to parse cron expression "${expression}": ${String(error)}`);
  }
}
