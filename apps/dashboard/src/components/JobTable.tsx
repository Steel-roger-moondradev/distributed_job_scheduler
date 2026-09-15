import { Eye, Pause, Play, Trash2 } from "lucide-react";
import { Job } from "../type/job.js";
import { formatDate } from "../utils/formatDate.js";

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
    <div className="overflow-hidden rounded-2xl bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400 sm:px-6">
                Job Name
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Type
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Priority
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Status
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Next Run
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Timeout
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Retries
              </th>

              <th className="whitespace-nowrap px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => {
              /*
               * Job.status controls the job lifecycle.
               *
               * CRON:
               *   ACTIVE -> PAUSED -> ACTIVE
               *
               * DELAYED:
               *   ACTIVE -> PAUSED -> ACTIVE
               *
               * ONCE:
               *   ACTIVE -> COMPLETED
               *   PAUSED -> ACTIVE
               *
               * Terminal states:
               *   COMPLETED / FAILED / CANCELLED
               *   No pause/resume actions.
               */

              // Only ACTIVE CRON and DELAYED jobs can be paused.
              // ONCE jobs can never be paused.
              const canPause =
                job.status === "ACTIVE" &&
                (job.type === "CRON" || job.type === "DELAYED");

              // Any PAUSED job can be resumed, including ONCE.
              const canResume = job.status === "PAUSED";

              return (
                <tr
                  key={job.id}
                  className="group transition-colors hover:bg-indigo-50/20"
                >
                  {/* Job Name */}
                  <td className="px-5 py-4 sm:px-6">
                    <div className="max-w-[230px]">
                      <p
                        className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-indigo-700"
                        title={job.name}
                      >
                        {job.name}
                      </p>

                      <p
                        className="mt-1 truncate font-mono text-[10px] text-slate-400"
                        title={job.id}
                      >
                        {job.id}
                      </p>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                      {job.type}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-slate-600">
                      {job.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        job.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : job.status === "PAUSED"
                            ? "bg-amber-50 text-amber-700"
                            : job.status === "COMPLETED"
                              ? "bg-blue-50 text-blue-700"
                              : job.status === "FAILED"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span
                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          job.status === "ACTIVE"
                            ? "bg-emerald-500"
                            : job.status === "PAUSED"
                              ? "bg-amber-500"
                              : job.status === "COMPLETED"
                                ? "bg-blue-500"
                                : job.status === "FAILED"
                                  ? "bg-rose-500"
                                  : "bg-slate-400"
                        }`}
                      />

                      {job.status}
                    </span>
                  </td>

                  {/* Next Run */}
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {job.nextRunAt ? formatDate(job.nextRunAt) : "—"}
                  </td>

                  {/* Timeout */}
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="font-mono text-xs font-medium text-slate-500">
                      {job.timeoutMs / 1000}s
                    </span>
                  </td>

                  {/* Retries */}
                  <td className="px-5 py-4">
                    <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      {job.maxRetries}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* View */}
                      <button
                        onClick={() => onView(job.id)}
                        aria-label={`View ${job.name}`}
                        title="View job"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                      >
                        <Eye size={16} strokeWidth={1.8} />
                      </button>

                      {/* Pause - ACTIVE CRON or DELAYED only */}
                      {canPause && (
                        <button
                          onClick={() => onPause(job.id)}
                          aria-label={`Pause ${job.name}`}
                          title="Pause job"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-600 active:scale-95"
                        >
                          <Pause size={16} strokeWidth={1.8} />
                        </button>
                      )}

                      {/* Resume - Any PAUSED job */}
                      {canResume && (
                        <button
                          onClick={() => onResume(job.id)}
                          aria-label={`Resume ${job.name}`}
                          title="Resume job"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-teal-50 hover:text-teal-600 active:scale-95"
                        >
                          <Play size={16} strokeWidth={1.8} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(job.id)}
                        aria-label={`Delete ${job.name}`}
                        title="Delete job"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center border-t border-slate-100 px-6 py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
              <Eye size={20} strokeWidth={1.7} />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              No jobs found
            </p>

            <p className="mt-1.5 text-xs text-slate-400">
              Create a job to start scheduling work.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
