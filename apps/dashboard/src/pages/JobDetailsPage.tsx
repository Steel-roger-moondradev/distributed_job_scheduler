import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJob } from "../hooks/useJob.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getJobHistory } from "../api/job.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import StatusBadge from "../components/StatusBadge.js";
import { formatDate } from "../utils/formatDate.js";
import { formatDuration } from "../utils/formatDuration.js";
import { toast } from "react-hot-toast";
import { Pause, Play, Trash } from "lucide-react";
import { pauseJob, resumeJob, deleteJob } from "../api/job.js";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.js";

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // -----------------------------------------------------------------
  // Job core data
  // -----------------------------------------------------------------
  const {
    data: job,
    isLoading: jobLoading,
    isError: jobError,
    error: jobErr,
    refetch: refetchJob,
  } = useJob(id ?? "");

  // -----------------------------------------------------------------
  // Execution history
  // -----------------------------------------------------------------
  const {
    data: history,
    isLoading: histLoading,
    isError: histError,
    error: histErr,
    refetch: refetchHist,
  } = useQuery({
    queryKey: ["jobHistory", id],
    queryFn: () => getJobHistory(id!).then((res) => res.data),
    enabled: !!id,
    staleTime: 0,
    refetchInterval: 5000,
  });

  // -----------------------------------------------------------------
  // Delete‑confirmation modal handling
  // -----------------------------------------------------------------
  const [showDelete, setShowDelete] = React.useState(false);

  const handlePause = async () => {
    const toastId = toast.loading("Pausing job...");
    try {
      await pauseJob(id!);
      toast.success("Job paused", { id: toastId });
      queryClient.invalidateQueries({
        queryKey: ["job", id],
      });
    } catch {
      toast.error("Failed to pause", { id: toastId });
    }
  };

  const handleResume = async () => {
    const toastId = toast.loading("Resuming job...");
    try {
      await resumeJob(id!);
      toast.success("Job resumed", { id: toastId });
      queryClient.invalidateQueries({
        queryKey: ["job", id],
      });
    } catch {
      toast.error("Failed to resume", { id: toastId });
    }
  };

  const handleDelete = async () => {
    const toastId = toast.loading("Deleting job...");
    try {
      await deleteJob(id!);
      toast.success("Job deleted", { id: toastId });
      queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });
      navigate("/jobs");
    } catch {
      toast.error("Failed to delete", { id: toastId });
    } finally {
      setShowDelete(false);
    }
  };

  // -----------------------------------------------------------------
  // Render states
  // -----------------------------------------------------------------
  if (jobLoading || histLoading) return <LoadingSpinner />;
  if (jobError)
    return (
      <ErrorState message={(jobErr as any).message} onRetry={refetchJob} />
    );
  if (histError)
    return (
      <ErrorState message={(histErr as any).message} onRetry={refetchHist} />
    );
  if (!job) return <EmptyState message="Job not found" />;

  // -----------------------------------------------------------------
  // Main UI
  // -----------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{job.name}</h2>
        <div className="flex gap-2">
          {job.status === "ACTIVE" && (
            <button
              onClick={handlePause}
              className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
              title="Pause job"
            >
              <Pause size={16} />
              Pause
            </button>
          )}
          {job.status === "PAUSED" && (
            <button
              onClick={handleResume}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
              title="Resume job"
            >
              <Play size={16} />
              Resume
            </button>
          )}
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
            title="Delete job"
          >
            <Trash size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Job details card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg shadow p-6">
        <div>
          <p className="text-sm text-gray-500">Job Name</p>
          <p className="font-medium">{job.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Type</p>
          <p className="font-medium">{job.type}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Priority</p>
          <p className="font-medium">{job.priority}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Status</p>
          <StatusBadge status={job.status} />
        </div>

        <div>
          <p className="text-sm text-gray-500">Next Run</p>
          <p className="font-medium">{formatDate(job.nextRunAt)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Timeout (s)</p>
          <p className="font-medium">{job.timeoutMs / 1000}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Retry Count</p>
          <p className="font-medium">{job.maxRetries}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Created At</p>
          <p className="font-medium">{formatDate(job.createdAt)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Updated At</p>
          <p className="font-medium">{formatDate(job.updatedAt)}</p>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm text-gray-500 mb-1">Payload</p>
          <pre className="bg-gray-50 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(job.payload, null, 2)}
          </pre>
        </div>
      </div>

      {/* Execution History */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Execution History</h3>
        {history && history.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Started At</th>
                  <th className="px-4 py-2 text-left">Finished At</th>
                  <th className="px-4 py-2 text-left">Duration</th>
                  <th className="px-4 py-2 text-left">Worker</th>
                  <th className="px-4 py-2 text-left">Attempts</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((run, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{formatDate(run.startedAt)}</td>
                    <td className="px-4 py-2">
                      {run.finishedAt ? formatDate(run.finishedAt) : "—"}
                    </td>
                    <td className="px-4 py-2">
                      {formatDuration(run.duration)}
                    </td>
                    <td className="px-4 py-2">{run.workerId}</td>
                    <td className="px-4 py-2">{run.attempts}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={run.status as any} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Noexecution history yet." />
        )}
      </section>

      <ConfirmDeleteModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        jobName={job.name}
      />
    </div>
  );
}
