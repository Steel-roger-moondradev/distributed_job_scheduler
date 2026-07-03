export interface Job {
  id: string;

  name: string;

  type: string;

  priority: number;

  timeoutMs: number;

  maxRetries: number;

  active: boolean;

  payload: any;

  status: string;

  nextRunAt: string;
}
