import { JobStatus } from "../type/job.js";

interface Props {
  status: JobStatus;
}

const statusConfig: Record<
  JobStatus,
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

  COMPLETED: {
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "Completed",
  },

  FAILED: {
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Failed",
  },

  CANCELLED: {
    dot: "bg-slate-500",
    bg: "bg-slate-100",
    text: "text-slate-600",
    label: "Cancelled",
  },
};

export default function JobStatusBadge({ status }: Props) {
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
