import { JobStatus } from "../type/job.js";

interface Props {
  status: JobStatus;
}

const colorMap: Record<JobStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
  RUNNING: "bg-blue-100 text-blue-800",
  QUEUED: "bg-gray-100 text-gray-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[status]}`}
    >
      {status}
    </span>
  );
}
