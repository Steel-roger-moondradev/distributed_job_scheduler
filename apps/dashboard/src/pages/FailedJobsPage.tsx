import { useQuery } from "@tanstack/react-query";
import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import { formatDate } from "../utils/formatDate.js";

export default function FailedJobsPage() {
  const {
    data: failedJobs,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["failedJobs"],
    queryFn: async () => {
      const { data } = await api.get("/jobs/failed");
      return data;
    },
    refetchInterval: 5000,
  });

  if (isLoading) return <LoadingSpinner />;

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Failed Jobs</h2>
        <p className="text-gray-500">Jobs that exhausted all retry attempts.</p>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Job ID</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Attempts</th>
              <th className="px-4 py-3 text-left">Failed At</th>
              <th className="px-4 py-3 text-left">Payload</th>
            </tr>
          </thead>

          <tbody>
            {failedJobs.map((job: any) => (
              <tr key={job.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{job.jobId}</td>

                <td className="px-4 py-3 text-red-600">{job.reason}</td>

                <td className="px-4 py-3">{job.attempts}</td>

                <td className="px-4 py-3">{formatDate(job.failedAt)}</td>

                <td className="px-4 py-3">
                  <details>
                    <summary className="cursor-pointer text-blue-600">
                      View Payload
                    </summary>

                    <pre className="mt-2 rounded bg-gray-100 p-2 text-xs overflow-auto">
                      {JSON.stringify(job.payload, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
