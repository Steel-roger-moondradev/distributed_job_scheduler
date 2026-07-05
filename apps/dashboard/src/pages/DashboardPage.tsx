import { useJobs } from "../hooks/useJobs.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import { Card } from "../components/Card.js"; // we’ll add a tiny Card helper later
import { queueSize } from "../api/job.js";
import { HealthCard } from "../components/healthcard.js";
import api from "../api/client.js";
import { useEffect, useState } from "react";
import { Workers } from "./WorkerPage.js";
import { RecentExecution, RecentFailedJob } from "../type/jobRun.js";
import { useQuery } from "@tanstack/react-query";

interface HealthStatus {
  redis: "connected" | "disconnected";
  database: "connected" | "disconnected";
  scheduler: "connected" | "disconnected";
  api: "connected" | "disconnected";
  timestamp: string;
}
interface WorkerStatus {
  id: string;
  status: "connected" | "disconnected";
  lastHeartbeat: string;
}
export default function DashboardPage() {
  const [healthstatus, setHealthStatus] = useState<HealthStatus>();
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus[]>();

  const { data: jobs, isLoading, isError, error, refetch } = useJobs();
  const [recentRuns, setRecentRuns] = useState<RecentExecution[]>([]);
  const [recentFails, setRecentFails] = useState<RecentFailedJob[]>([]);

  useEffect(() => {
    api
      .get<RecentExecution[]>("/jobs/job-runs/recent")
      .then((res) => setRecentRuns(res.data));
  }, []);

  useEffect(() => {
    api
      .get<RecentFailedJob[]>("/jobs/job-fails/recent")
      .then((res) => setRecentFails(res.data));
  }, []);

  useEffect(() => {
    api.get<HealthStatus>("/health").then((res) => {
      setHealthStatus(res.data);
    });
  }, []);

  useEffect(() => {
    api.get<WorkerStatus[]>("/workers").then((res) => {
      setWorkerStatus(res.data);
    });
  }, []);
  const { data: queueSize } = useQuery({
    queryKey: ["queue-size"],
    queryFn: async () => {
      const { data } = await api.get<number>("/jobs/dashboard");
      return data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <ErrorState message={(error as any).message} onRetry={refetch} />;
  if (!jobs) return <EmptyState />;

  const total = jobs.length;
  const active = jobs.filter((j) => j.status === "ACTIVE").length;
  const running = jobs.filter((j) => j.status === "RUNNING").length;
  const failed = jobs.filter((j) => j.status === "FAILED").length;
  const statusColor = (status: RecentExecution["status"]) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500";

      case "FAILED":
        return "bg-red-500";

      case "RUNNING":
        return "bg-blue-500";

      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Metrics */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Queue Overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card title="Total Jobs" value={total.toString()} />
          <Card title="Active Jobs" value={active.toString()} />
          <Card title="Running Jobs" value={running.toString()} />
          <Card title="Failed Jobs" value={failed.toString()} />
          <Card title="Queue Size" value={queueSize?.toString() ?? "0"} />{" "}
        </div>
      </section>

      {/* Health */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          System Health
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <HealthCard
            title="API"
            status={healthstatus?.api === "connected" ? "healthy" : "error"}
            description={
              healthstatus?.api === "connected"
                ? "Express server responding"
                : "API unavailable"
            }
          />

          <HealthCard
            title="Redis"
            status={healthstatus?.redis === "connected" ? "healthy" : "error"}
            description={
              healthstatus?.redis === "connected"
                ? "BullMQ connected"
                : "Redis disconnected"
            }
          />

          <HealthCard
            title="PostgreSQL"
            status={
              healthstatus?.database === "connected" ? "healthy" : "error"
            }
            description={
              healthstatus?.database === "connected"
                ? "Prisma connected"
                : "Database unavailable"
            }
          />

          <HealthCard
            title="Scheduler"
            status={
              healthstatus?.scheduler === "connected" ? "healthy" : "error"
            }
            description={
              healthstatus?.scheduler === "connected"
                ? "Heartbeat received"
                : "Heartbeat missing"
            }
          />

          <div className="col-span-full ">
            <div className="col-span-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="col-span-full mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Workers</h3>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {workerStatus?.filter((w) => w.status === "connected")
                    .length ?? 0}
                  /{workerStatus?.length ?? 0} Active
                </span>
              </div>

              <div className="space-y-2">
                {workerStatus?.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          worker.status === "connected"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="font-medium">{worker.id}</span>
                    </div>

                    <span className="text-gray-500">
                      {new Date(worker.lastHeartbeat).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <Workers />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Recent Executions
        </h2>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {recentRuns.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No executions yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-3 w-3 rounded-full ${statusColor(run.status)}`}
                    />

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {run.job.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Worker: {run.workerId ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        run.status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : run.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : run.status === "RUNNING"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {run.status}
                    </span>

                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(run.startedAt).toLocaleString()}
                    </p>

                    {run.duration && (
                      <p className="text-xs text-gray-400">{run.duration} ms</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Recent Failed Jobs
        </h2>

        <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
          {recentFails.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No failed jobs 🎉
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentFails.map((job) => (
                <div
                  key={job.id}
                  className="flex items-start justify-between gap-6 px-6 py-5 hover:bg-red-50 transition-colors"
                >
                  <div className="flex flex-1 items-start gap-4">
                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                      <span className="text-lg">❌</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900">
                        {job.job.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {job.reason}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Attempts:{" "}
                          <span className="font-medium text-gray-700">
                            {job.attempts}
                          </span>
                        </span>

                        <span>{new Date(job.failedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    FAILED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
