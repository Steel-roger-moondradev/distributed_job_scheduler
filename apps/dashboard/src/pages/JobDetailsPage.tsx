import { ReactNode, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pause,
  Play,
  Trash2,
  RefreshCw,
  Copy,
  Eye,
  X,
  CheckCircle2,
  Clock3,
  Zap,
  RotateCcw,
  Activity,
} from "lucide-react";
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

interface InfoCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  accent?: "indigo" | "violet" | "teal" | "amber";
}

function InfoCard({ title, icon, children, accent = "indigo" }: InfoCardProps) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
          {icon}
          {title}
        </div>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles[accent]}`}
        >
          {icon || <Activity size={14} />}
        </div>
      </div>

      <div className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
        {children}
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  accent?: "indigo" | "violet" | "teal" | "amber" | "rose";
  action?: ReactNode;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  accent = "indigo",
  action,
}: SectionHeaderProps) {
  const colors = {
    indigo: "text-indigo-500",
    violet: "text-violet-500",
    teal: "text-teal-600",
    amber: "text-amber-600",
    rose: "text-rose-500",
  };

  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${colors[accent]}`}
          >
            {eyebrow}
          </p>
        )}

        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {action}
    </div>
  );
}

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDelete, setShowDelete] = useState(false);
  const [selectedResult, setSelectedResult] = useState<unknown>(null);
  const [showResult, setShowResult] = useState(false);

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
    isFetching: historyFetching,
  } = useQuery({
    queryKey: ["jobHistory", id],
    queryFn: () => getJobHistory(id!).then((response) => response.data),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const refreshAll = () => {
    void refetchJob();
    void refetchHistory();
  };

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(job?.payload, null, 2),
      );

      toast.success("Payload copied");
    } catch {
      toast.error("Failed to copy payload");
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(selectedResult, null, 2),
      );

      toast.success("Result copied");
    } catch {
      toast.error("Failed to copy result");
    }
  };

  const openResult = (result: unknown) => {
    setSelectedResult(result);
    setShowResult(true);
  };

  const closeResult = () => {
    setShowResult(false);
    setSelectedResult(null);
  };

  const handlePause = async () => {
    if (!id) return;

    const toastId = toast.loading("Pausing job...");

    try {
      await pauseJob(id);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["job", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["jobs"],
        }),
      ]);

      toast.success("Job paused", { id: toastId });
    } catch {
      toast.error("Failed to pause job", { id: toastId });
    }
  };

  const handleResume = async () => {
    if (!id) return;

    const toastId = toast.loading("Resuming job...");

    try {
      await resumeJob(id);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["job", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["jobs"],
        }),
      ]);

      toast.success("Job resumed", { id: toastId });
    } catch {
      toast.error("Failed to resume job", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const toastId = toast.loading("Deleting job...");

    try {
      await deleteJob(id);

      await queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });

      toast.success("Job deleted", { id: toastId });
      navigate("/jobs");
    } catch {
      toast.error("Delete failed", { id: toastId });
    } finally {
      setShowDelete(false);
    }
  };

  if (jobLoading || historyLoading) {
    return <LoadingSpinner />;
  }

  if (jobError) {
    return (
      <ErrorState
        message={(jobErr as Error).message}
        onRetry={() => {
          void refetchJob();
        }}
      />
    );
  }

  if (historyError) {
    return (
      <ErrorState
        message={(historyErr as Error).message}
        onRetry={() => {
          void refetchHistory();
        }}
      />
    );
  }

  if (!job) {
    return <EmptyState message="Job not found" />;
  }

  return (
    <>
      <div className="space-y-8">
        <ConfirmDeleteModal
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          jobName={job.name}
        />

        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/50 p-6 sm:p-8">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <button
                  onClick={() => navigate(-1)}
                  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
                >
                  <ArrowLeft size={16} />
                  Back to Jobs
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {job.name}
                  </h1>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      job.active
                        ? "bg-teal-50 text-teal-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <span
                      className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                        job.active ? "bg-teal-500" : "bg-slate-400"
                      }`}
                    />

                    {job.active ? "Active" : "Paused"}
                  </span>
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                  {job.description || "No description provided."}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                  <span className="rounded-md bg-white/80 px-2 py-1 font-mono text-indigo-600 ring-1 ring-slate-200/70">
                    {job.id}
                  </span>

                  <span>Created {formatDate(job.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={refreshAll}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <RefreshCw
                    size={16}
                    className={historyFetching ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <button
                  onClick={() => void copyPayload()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Copy size={16} />
                  Copy Payload
                </button>

                {job.active ? (
                  <button
                    onClick={() => void handlePause()}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => void handleResume()}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md"
                  >
                    <Play size={16} />
                    Resume
                  </button>
                )}

                <button
                  onClick={() => setShowDelete(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-600 transition-all hover:bg-rose-100"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="space-y-5">
          <SectionHeader
            eyebrow="Configuration"
            title="Overview"
            description="General configuration and execution settings."
            accent="indigo"
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Schedule Type"
              icon={<Zap size={13} />}
              accent="violet"
            >
              {job.type}
            </InfoCard>

            <InfoCard
              title="Job Type"
              icon={<Activity size={13} />}
              accent="indigo"
            >
              {job.jobtype}
            </InfoCard>

            <InfoCard
              title="Priority"
              icon={<Clock3 size={13} />}
              accent="amber"
            >
              {job.priority}
            </InfoCard>

            <InfoCard
              title="Status"
              icon={<CheckCircle2 size={13} />}
              accent="teal"
            >
              <span className={job.active ? "text-teal-600" : "text-slate-400"}>
                {job.active ? "Active" : "Paused"}
              </span>
            </InfoCard>

            <InfoCard title="Next Run" accent="indigo">
              <span className="text-sm font-medium">
                {job.nextRunAt ? formatDate(job.nextRunAt) : "—"}
              </span>
            </InfoCard>

            <InfoCard
              title="Timeout"
              icon={<Clock3 size={13} />}
              accent="amber"
            >
              {job.timeoutMs / 1000}s
            </InfoCard>

            <InfoCard
              title="Max Retries"
              icon={<RotateCcw size={13} />}
              accent="violet"
            >
              {job.maxRetries}
            </InfoCard>

            <InfoCard title="Created" accent="teal">
              <span className="text-sm font-medium">
                {formatDate(job.createdAt)}
              </span>
            </InfoCard>
          </div>
        </section>

        {/* Metadata */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-7">
          <SectionHeader
            eyebrow="Details"
            title="Metadata"
            description="Additional information and scheduling details."
            accent="violet"
          />

          <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
            <MetadataItem label="Job Type" value={job.jobtype} />

            <MetadataItem label="Schedule Type" value={job.type} />

            <MetadataItem
              label="Cron Expression"
              value={job.cronExpression || "—"}
              mono
            />

            <MetadataItem
              label="Next Run"
              value={job.nextRunAt ? formatDate(job.nextRunAt) : "—"}
            />

            <MetadataItem
              label="Updated At"
              value={formatDate(job.updatedAt)}
            />

            <MetadataItem
              label="Description"
              value={job.description || "No description"}
            />

            <MetadataItem label="Job ID" value={job.id} mono />
          </div>
        </section>

        {/* Payload */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeader
              eyebrow="Request"
              title="Payload"
              description="JSON payload that will be sent to the worker."
              accent="indigo"
            />

            <button
              onClick={() => void copyPayload()}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100"
            >
              <Copy size={15} />
              Copy
            </button>
          </div>

          <div className="overflow-x-auto bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Job Payload
              </span>

              <span className="font-mono text-[10px] text-slate-600">JSON</span>
            </div>

            <pre className="max-h-[500px] overflow-auto p-6 font-mono text-xs leading-6 text-slate-300">
              <code>{JSON.stringify(job.payload, null, 2)}</code>
            </pre>
          </div>
        </section>

        {/* Execution History */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeader
              eyebrow="Runtime"
              title="Execution History"
              description="Recent executions of this job."
              accent="teal"
            />

            <span className="inline-flex w-fit items-center rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700">
              {history?.length ?? 0}{" "}
              {(history?.length ?? 0) === 1 ? "Run" : "Runs"}
            </span>
          </div>

          {history && history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 bg-slate-50/70">
                  <tr>
                    {[
                      "Started",
                      "Finished",
                      "Duration",
                      "Worker",
                      "Attempts",
                      "Status",
                      "Result",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {history.map((run) => (
                    <tr
                      key={run.id}
                      className="transition-colors hover:bg-indigo-50/20"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {formatDate(run.startedAt)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {run.finishedAt ? formatDate(run.finishedAt) : "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          {run.duration != null
                            ? formatDuration(run.duration)
                            : "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div
                          className="max-w-[180px] truncate font-mono text-xs text-slate-500"
                          title={run.workerId ?? undefined}
                        >
                          {run.workerId ?? "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex min-w-7 justify-center rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                          {run.attempts}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={run.status} />
                      </td>

                      <td className="px-6 py-4">
                        {run.result != null ? (
                          <button
                            onClick={() => openResult(run.result)}
                            className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition-all hover:bg-indigo-100"
                          >
                            <Eye size={14} />
                            View Result
                          </button>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Clock3 size={22} className="text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-800">
                No execution history
              </h3>

              <p className="mt-1.5 text-sm text-slate-500">
                This job hasn't been executed yet.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onClick={closeResult}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-600">
                  Execution
                </p>

                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                  Execution Result
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Response returned by the job handler.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => void copyResult()}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100"
                >
                  <Copy size={15} />
                  Copy
                </button>

                <button
                  onClick={closeResult}
                  aria-label="Close result"
                  className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-auto bg-slate-950">
              <div className="border-b border-slate-800 px-6 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Response
                </span>
              </div>

              <pre className="whitespace-pre-wrap break-words p-6 font-mono text-xs leading-6 text-slate-300">
                {JSON.stringify(selectedResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MetadataItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm text-slate-700 ${
          mono ? "break-all font-mono text-xs" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
