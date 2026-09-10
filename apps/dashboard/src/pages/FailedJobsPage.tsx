import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, Clock3, RefreshCw } from "lucide-react";

import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import { formatDate } from "../utils/formatDate.js";

interface FailedJob {
  id: string;
  jobId: string;
  reason: string;
  attempts: number;
  failedAt: string;
  payload: unknown;
}

export default function FailedJobsPage() {
  const {
    data: failedJobs,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<FailedJob[]>({
    queryKey: ["failedJobs"],
    queryFn: async () => {
      const { data } = await api.get("/jobs/failed");
      return data;
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorState
        message={(error as Error).message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!failedJobs?.length) {
    return <EmptyState message="No failed jobs." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-500">
            Reliability
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Failed Jobs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Jobs that exhausted all retry attempts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            {failedJobs.length} failed
          </div>

          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700 transition-all hover:border-indigo-200 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle size={17} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Failure History
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Recent jobs that could not be completed successfully.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
            <Clock3 size={13} />
            Live updates
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50/70">
              <tr>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:px-6">
                  Job ID
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Failure Reason
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Attempts
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Failed At
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Payload
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {failedJobs.map((job) => (
                <tr
                  key={job.id}
                  className="transition-colors hover:bg-rose-50/20"
                >
                  <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                    <span className="font-mono text-xs font-medium text-indigo-600">
                      {job.jobId}
                    </span>
                  </td>

                  <td className="max-w-md px-5 py-4">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />

                      <p
                        className="truncate text-sm font-medium text-slate-700"
                        title={job.reason}
                      >
                        {job.reason}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {job.attempts}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {formatDate(job.failedAt)}
                  </td>

                  <td className="px-5 py-4">
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700">
                        <span className="group-open:hidden">View Payload</span>

                        <span className="hidden group-open:inline">
                          Hide Payload
                        </span>

                        <ChevronDown
                          size={14}
                          className="transition-transform group-open:rotate-180"
                        />
                      </summary>

                      <div className="mt-3 max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Payload
                          </span>

                          <span className="font-mono text-[10px] text-slate-600">
                            JSON
                          </span>
                        </div>

                        <pre className="max-h-80 overflow-auto p-4 font-mono text-xs leading-5 text-slate-300">
                          {JSON.stringify(job.payload, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-3.5 sm:px-6">
          <p className="text-xs text-slate-400">
            Automatically refreshed every 5 seconds.
          </p>
        </div>
      </section>
    </div>
  );
}
