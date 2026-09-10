import { JobStatus } from "../type/job.js";
import { JobRunStatus } from "../type/jobRun.js";

type Status = JobStatus | JobRunStatus;

interface Props {
  status: Status;
}

const statusConfig: Record<
  Status,
  {
    dot: string;
    bg: string;
    text: string;
    label: string;
  }
> = {
  ACTIVE: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Active",
  },

  PAUSED: {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Paused",
  },

  PENDING: {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Pending",
  },

  QUEUED: {
    dot: "bg-slate-400",
    bg: "bg-slate-100",
    text: "text-slate-600",
    label: "Queued",
  },

  RUNNING: {
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "Running",
  },

  SUCCESS: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Success",
  },

  FAILED: {
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Failed",
  },

  COMPLETED: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Completed",
  },
};

export default function StatusBadge({ status }: Props) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
        aria-hidden="true"
      />

      {config.label}
    </span>
  );
}
