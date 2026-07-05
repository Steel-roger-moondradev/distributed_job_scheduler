import { JobStatus } from "../type/job.js";
import { JobRunStatus } from "../type/jobRun.js";

type Status = JobStatus | JobRunStatus;

type Props = {
  status: Status;
};

const colorMap: Record<Status, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
  QUEUED: "bg-gray-100 text-gray-800",
  RUNNING: "bg-blue-100 text-blue-800",
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[status]}`}
    >
      {status}
    </span>
  );
}
