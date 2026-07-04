import { Eye } from "lucide-react";

type FailedJob = {
  id: string;
  jobId: string;
  reason: string;
  attempts: number;
  failedAt: string;
};

const failedJobs: FailedJob[] = [
  {
    id: "1",
    jobId: "job_12345",
    reason: "Connection timeout",
    attempts: 3,
    failedAt: "2026-07-05 14:22",
  },
  {
    id: "2",
    jobId: "job_67890",
    reason: "SMTP Authentication Failed",
    attempts: 3,
    failedAt: "2026-07-05 15:10",
  },
];

export default function FailedJobs() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Failed Jobs</h1>

        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
          {failedJobs.length} Failed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Job ID</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-center">Attempts</th>
              <th className="px-4 py-3 text-center">Failed At</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {failedJobs.map((job) => (
              <tr key={job.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-medium">{job.jobId}</td>

                <td className="px-4 py-4 text-red-600">{job.reason}</td>

                <td className="px-4 py-4 text-center">{job.attempts}</td>

                <td className="px-4 py-4 text-center">{job.failedAt}</td>

                <td className="px-4 py-4 text-center">
                  <button className="rounded-lg p-2 hover:bg-gray-100">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {failedJobs.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No failed jobs 🎉
          </div>
        )}
      </div>
    </div>
  );
}
