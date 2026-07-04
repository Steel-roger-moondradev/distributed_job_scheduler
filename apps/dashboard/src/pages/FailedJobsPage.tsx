import React from "react";
import { useFailedJobs } from "../hooks/useFailedJobs.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import { formatDate } from "../utils/formatDate.js";
import { retryFailedJob } from "../api/job.js";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";

export default function FailedJobsPage() {
  const queryClient = useQueryClient();

  const {
    data: failedJobs,
    isLoading,
    isError,
    error,
    refetch,
  } = useFailedJobs();

  const handleRetry = async (id: string) => {
    const toastId = toast.loading("Retrying failed job...");
    try {
      await retryFailedJob(id);
      toast.success("Retry request sent", { id: toastId });
      // Invalidate the failed‑jobs query so the table refreshes
      queryClient.invalidateQueries({
        queryKey: ["failedJobs"],
      });
    } catch (e) {
      toast.error("Retry failed", { id: toastId });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <ErrorState message={(error as any).message} onRetry={refetch} />;
  if (!failedJobs || failedJobs.length === 0)
    return <EmptyState message="No failed jobs in the DLQ." />;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Failed Jobs (DLQ)</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Job Name</th>
              <th className="px-4 py-2 text-left">Failure Reason</th>
              <th className="px-4 py-2 text-left">Payload</th>
              <th className="px-4 py-2 text-left">Failed At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {failedJobs.map((fj) => (
              <tr key={fj.id} className="border-t">
                <td className="px-4 py-2">{fj.job.name}</td>
                <td className="px-4 py-2">{fj.reason}</td>
                <td className="px-4 py-2">
                  <pre className="bg-gray-50 p-1 rounded text-xs overflow-auto">
                    {JSON.stringify(fj.payload, null, 2)}
                  </pre>
                </td>
                <td className="px-4 py-2">{formatDate(fj.failedAt)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleRetry(fj.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    <RefreshCcw size={14} />
                    Retry
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
