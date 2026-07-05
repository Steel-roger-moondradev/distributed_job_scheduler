import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pause, Play, Trash2, RefreshCw, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

import { useJob } from "../hooks/useJob.js";
import { getJobHistory, pauseJob, resumeJob, deleteJob } from "../api/job.js";

import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import StatusBadge from "../components/StatusBadge.js";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.js";

import { formatDate } from "../utils/formatDate.js";
import { formatDuration } from "../utils/formatDuration.js";

export default function JobDetailsPage() {
  type InfoCardProps = {
    title: string;
    children: React.ReactNode;
  };

  function InfoCard({ title, children }: InfoCardProps) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <div className="mt-3 text-xl font-semibold text-gray-900">
          {children}
        </div>
      </div>
    );
  }
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [showDelete, setShowDelete] = React.useState(false);

  const {
    data: job,
    isLoading: jobLoading,
    isError: jobError,
    error: jobErr,
    refetch: refetchJob,
  } = useJob(id ?? "");

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErr,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["jobHistory", id],
    queryFn: () => getJobHistory(id!).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const refreshAll = () => {
    void refetchJob();
    void refetchHistory();
  };

  const copyPayload = async () => {
    await navigator.clipboard.writeText(JSON.stringify(job?.payload, null, 2));

    toast.success("Payload copied");
  };

  const handlePause = async () => {
    const toastId = toast.loading("Pausing job...");

    try {
      await pauseJob(id!);

      queryClient.invalidateQueries({
        queryKey: ["job", id],
      });

      toast.success("Job paused", {
        id: toastId,
      });
    } catch {
      toast.error("Failed to pause job", {
        id: toastId,
      });
    }
  };

  const handleResume = async () => {
    const toastId = toast.loading("Resuming job...");

    try {
      await resumeJob(id!);

      queryClient.invalidateQueries({
        queryKey: ["job", id],
      });

      toast.success("Job resumed", {
        id: toastId,
      });
    } catch {
      toast.error("Failed to resume job", {
        id: toastId,
      });
    }
  };

  const handleDelete = async () => {
    const toastId = toast.loading("Deleting job...");

    try {
      await deleteJob(id!);

      toast.success("Job deleted", {
        id: toastId,
      });

      navigate("/jobs");
    } catch {
      toast.error("Delete failed", {
        id: toastId,
      });
    } finally {
      setShowDelete(false);
    }
  };

  if (jobLoading || historyLoading) {
    return <LoadingSpinner />;
  }

  if (jobError) {
    return (
      <ErrorState message={(jobErr as Error).message} onRetry={refetchJob} />
    );
  }

  if (historyError) {
    return (
      <ErrorState
        message={(historyErr as Error).message}
        onRetry={refetchHistory}
      />
    );
  }

  if (!job) {
    return <EmptyState message="Job not found" />;
  }

  return (
    <div className="space-y-6">
      <ConfirmDeleteModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        jobName={job.name}
      />

      {/* Header */}

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-5 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Back to Jobs
            </button>

            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">{job.name}</h1>

              <StatusBadge status={job.status} />
            </div>

            <p className="mt-3 max-w-3xl text-gray-600">
              {job.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={refreshAll}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            <button
              onClick={copyPayload}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
            >
              <Copy size={18} />
              Copy Payload
            </button>

            {job.status === "ACTIVE" && (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 rounded-lg bg-yellow-500 px-5 py-2 text-white hover:bg-yellow-600"
              >
                <Pause size={18} />
                Pause
              </button>
            )}

            {job.status === "PAUSED" && (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
              >
                <Play size={18} />
                Resume
              </button>
            )}

            <button
              onClick={() => {
                setShowDelete(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Overview</h2>

          <p className="text-sm text-gray-500">
            General information about this job.
          </p>
        </div>
      </section>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Status */}

        <InfoCard title="Status">
          <StatusBadge status={job.status} />
        </InfoCard>

        <InfoCard title="Type">
          <p className="text-2xl font-semibold">{job.type}</p>
        </InfoCard>

        <InfoCard title="Priority">
          <p className="text-2xl font-semibold">{job.priority}</p>
        </InfoCard>

        <InfoCard title="Active">
          <p
            className={`text-2xl font-semibold ${
              job.active ? "text-green-600" : "text-red-600"
            }`}
          >
            {job.active ? "Yes" : "No"}
          </p>
        </InfoCard>

        <InfoCard title="Next Run">
          <p className="text-base font-medium">
            {job.nextRunAt ? formatDate(job.nextRunAt) : "—"}
          </p>
        </InfoCard>

        <InfoCard title="Timeout">
          <p className="mt-3 text-2xl font-semibold">{job.timeoutMs / 1000}s</p>
        </InfoCard>

        <InfoCard title="Max Retries">
          <p className="mt-3 text-2xl font-semibold">{job.maxRetries}</p>
        </InfoCard>

        <InfoCard title="Created">
          <p className="mt-3 text-base font-medium">
            {formatDate(job.createdAt)}
          </p>
        </InfoCard>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Metadata</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Updated At</p>

            <p className="mt-1 font-medium">{formatDate(job.updatedAt)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Cron Expression</p>

            <p className="mt-1 font-medium break-all">
              {job.cronExpression || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Description</p>

            <p className="mt-1">{job.description || "No description"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Job ID</p>

            <p className="mt-1 break-all font-mono text-sm">{job.id}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Payload</h2>

            <p className="mt-1 text-sm text-gray-500">
              JSON payload that will be sent to the worker.
            </p>
          </div>

          <button
            onClick={copyPayload}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            <Copy size={16} />
            Copy
          </button>
        </div>

        <div className="overflow-x-auto bg-slate-900">
          <pre className="max-h-[500px] overflow-auto p-6 text-sm leading-7 text-green-300">
            <code>{JSON.stringify(job.payload, null, 2)}</code>
          </pre>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Execution History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Recent executions of this job.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {history?.length ?? 0} Runs
          </span>
        </div>

        {history && history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-sm font-semibold text-gray-700">
                  <th className="px-6 py-4">Started</th>

                  <th className="px-6 py-4">Finished</th>

                  <th className="px-6 py-4">Duration</th>

                  <th className="px-6 py-4">Worker</th>

                  <th className="px-6 py-4">Attempts</th>

                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {history.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(run.startedAt)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {run.finishedAt ? formatDate(run.finishedAt) : "—"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {run.duration != null
                        ? formatDuration(run.duration)
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-[170px] truncate rounded bg-gray-100 px-2 py-1 font-mono text-sm">
                        {run.workerId ?? "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">{run.attempts}</td>

                    <td className="px-6 py-4">
                      <StatusBadge status={run.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 6.75h12m-12 5.25h12m-12 5.25h12M3.75 6.75h.008v.008H3.75zm0 5.25h.008v.008H3.75zm0 5.25h.008v.008H3.75z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              No execution history
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              This job hasn't been executed yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
