import { useJobs } from "../hooks/useJobs.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import { Card } from "../components/Card.js"; // we’ll add a tiny Card helper later
import { queueSize } from "../api/job.js";
import { HealthCard } from "../components/healthcard.js";
import api from "../api/client.js";
import { useEffect, useState } from "react";

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

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <ErrorState message={(error as any).message} onRetry={refetch} />;
  if (!jobs) return <EmptyState />;

  const total = jobs.length;
  const active = jobs.filter((j) => j.status === "ACTIVE").length;
  const running = jobs.filter((j) => j.status === "RUNNING").length;
  const failed = jobs.filter((j) => j.status === "FAILED").length;

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
          <Card title="Queue Size" value={queueSize().toString()} />
        </div>
      </section>

      {/* Health */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          System Health
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
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
    </div>
  );
}
