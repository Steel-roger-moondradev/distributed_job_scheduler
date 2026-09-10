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
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Failed Jobs
          </h1>

          <p className="mt-0.5 text-sm text-slate-400">
            Jobs that failed during execution
          </p>
        </div>

        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
          {failedJobs.length} Failed
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Job ID
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reason
              </th>

              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                Attempts
              </th>

              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                Failed At
              </th>

              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {failedJobs.map((job) => (
              <tr
                key={job.id}
                className="transition-colors hover:bg-slate-50/60"
              >
                {/* Job ID */}
                <td className="whitespace-nowrap px-5 py-4">
                  <span className="font-mono text-sm font-medium text-slate-700">
                    {job.jobId}
                  </span>
                </td>

                {/* Reason */}
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-600">{job.reason}</span>
                </td>

                {/* Attempts */}
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {job.attempts}
                  </span>
                </td>

                {/* Failed At */}
                <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-slate-500">
                  {job.failedAt}
                </td>

                {/* Action */}
                <td className="px-5 py-4 text-center">
                  <button
                    aria-label={`View ${job.jobId}`}
                    title="View job"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Eye size={16} strokeWidth={1.8} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {failedJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              ✓
            </div>

            <p className="text-sm font-medium text-slate-700">No failed jobs</p>

            <p className="mt-1 text-xs text-slate-400">
              All jobs are running successfully.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
