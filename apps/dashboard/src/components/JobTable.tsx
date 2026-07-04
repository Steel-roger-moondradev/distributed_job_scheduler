import { Job } from "../type/job.js";
import { formatDate } from "../utils/formatDate.js";
import StatusBadge from "./StatusBadge.js";

interface Props {
  jobs: Job[];
  onView: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function JobTable({
  jobs,
  onView,
  onPause,
  onResume,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Job Name</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Priority</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Next Run</th>
            <th className="px-4 py-2 text-left">Timeout</th>
            <th className="px-4 py-2 text-left">Retry Count</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-t">
              <td className="px-4 py-2">{job.name}</td>
              <td className="px-4 py-2">{job.type}</td>
              <td className="px-4 py-2">{job.priority}</td>
              <td className="px-4 py-2">
                <StatusBadge status={job.status} />
              </td>
              <td className="px-4 py-2">
                {job.nextRunAt && formatDate(job.nextRunAt)}
              </td>
              <td className="px-4 py-2">{job.timeoutMs / 1000}s</td>
              <td className="px-4 py-2">{job.maxRetries}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => onView(job.id)}
                  className="text-blue-600 hover:underline"
                >
                  View
                </button>
                {job.status === "ACTIVE" && (
                  <button
                    onClick={() => onPause(job.id)}
                    className="text-yellow-600 hover:underline"
                  >
                    Pause
                  </button>
                )}
                {job.status === "PAUSED" && (
                  <button
                    onClick={() => onResume(job.id)}
                    className="text-green-600 hover:underline"
                  >
                    Resume
                  </button>
                )}
                <button
                  onClick={() => onDelete(job.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
