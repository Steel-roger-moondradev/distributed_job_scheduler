import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Server,
  XCircle,
  Layers3,
  PlayCircle,
  AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useJobs } from "../hooks/useJobs.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import { Card } from "../components/Card.js";
import { HealthCard } from "../components/healthcard.js";
import StatusBadge from "../components/StatusBadge.js";
import api from "../api/client.js";
import { Workers } from "./WorkerPage.js";
import { RecentExecution, RecentFailedJob } from "../type/jobRun.js";

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
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus[]>([]);
  const [recentRuns, setRecentRuns] = useState<RecentExecution[]>([]);
  const [recentFails, setRecentFails] = useState<RecentFailedJob[]>([]);

  const { data: jobs, isLoading, isError, error, refetch } = useJobs();

  const { data: queueSize } = useQuery({
    queryKey: ["queue-size"],
    queryFn: async () => {
      const { data } = await api.get<number>("/jobs/dashboard");
      return data;
    },
  });

  useEffect(() => {
    api
      .get<RecentExecution[]>("/jobs/job-runs/recent")
      .then((res) => setRecentRuns(res.data))
      .catch(() => setRecentRuns([]));
  }, []);

  useEffect(() => {
    api
      .get<RecentFailedJob[]>("/jobs/job-fails/recent")
      .then((res) => setRecentFails(res.data))
      .catch(() => setRecentFails([]));
  }, []);

  useEffect(() => {
    api
      .get<HealthStatus>("/health")
      .then((res) => setHealthStatus(res.data))
      .catch(() => setHealthStatus(undefined));
  }, []);

  useEffect(() => {
    api
      .get<WorkerStatus[]>("/workers")
      .then((res) => setWorkerStatus(res.data))
      .catch(() => setWorkerStatus([]));
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : "Failed to load dashboard"
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!jobs) {
    return <EmptyState />;
  }

  const total = jobs.length;

  const active = jobs.filter((job) => job.active).length;

  const running = recentRuns.filter((run) => run.status === "RUNNING").length;

  const failed = recentRuns.filter((run) => run.status === "FAILED").length;

  const connectedWorkers = workerStatus.filter(
    (worker) => worker.status === "connected",
  ).length;

  const healthItems = [
    {
      title: "API",
      connected: healthstatus?.api === "connected",
      description:
        healthstatus?.api === "connected"
          ? "Express server responding"
          : "API unavailable",
    },
    {
      title: "Redis",
      connected: healthstatus?.redis === "connected",
      description:
        healthstatus?.redis === "connected"
          ? "BullMQ connected"
          : "Redis disconnected",
    },
    {
      title: "PostgreSQL",
      connected: healthstatus?.database === "connected",
      description:
        healthstatus?.database === "connected"
          ? "Prisma connected"
          : "Database unavailable",
    },
    {
      title: "Scheduler",
      connected: healthstatus?.scheduler === "connected",
      description:
        healthstatus?.scheduler === "connected"
          ? "Heartbeat received"
          : "Heartbeat missing",
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Overview"
            title="Queue Overview"
            description="Current state of scheduled and running jobs."
          />

          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Scheduler Active
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <PremiumCard
            title="Total Jobs"
            value={total}
            icon={<Layers3 size={17} />}
            iconBackground="bg-indigo-50"
            iconColor="text-indigo-600"
            valueColor="text-indigo-700"
          />

          <PremiumCard
            title="Active Jobs"
            value={active}
            icon={<CheckCircle2 size={17} />}
            iconBackground="bg-teal-50"
            iconColor="text-teal-600"
            valueColor="text-teal-700"
          />

          <PremiumCard
            title="Running Jobs"
            value={running}
            icon={<PlayCircle size={17} />}
            iconBackground="bg-amber-50"
            iconColor="text-amber-600"
            valueColor="text-amber-700"
          />

          <PremiumCard
            title="Failed Jobs"
            value={failed}
            icon={<AlertTriangle size={17} />}
            iconBackground="bg-rose-50"
            iconColor="text-rose-600"
            valueColor="text-rose-700"
          />

          <PremiumCard
            title="Queue Size"
            value={queueSize ?? 0}
            icon={<Activity size={17} />}
            iconBackground="bg-violet-50"
            iconColor="text-violet-600"
            valueColor="text-violet-700"
          />
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Infrastructure"
          title="System Health"
          description="Current availability of scheduler infrastructure."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {healthItems.map((item) => (
            <HealthCard
              key={item.title}
              title={item.title}
              status={item.connected ? "healthy" : "error"}
              description={item.description}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Infrastructure"
            title="Workers"
            description="Connected workers and their latest heartbeat."
          />

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              connectedWorkers === workerStatus.length &&
              workerStatus.length > 0
                ? "bg-teal-50 text-teal-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connectedWorkers === workerStatus.length &&
                workerStatus.length > 0
                  ? "bg-teal-500"
                  : "bg-amber-500"
              }`}
            />
            {connectedWorkers}/{workerStatus.length} Active
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          {workerStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                <Server size={20} />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-800">
                No workers connected
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Start a worker to begin processing jobs.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {workerStatus.map((worker) => {
                const connected = worker.status === "connected";

                return (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between gap-5 px-5 py-4 transition-colors hover:bg-indigo-50/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          connected ? "bg-teal-500" : "bg-rose-400"
                        }`}
                      />

                      <div className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-700">
                          {worker.id}
                        </span>

                        <span
                          className={`text-[11px] ${
                            connected ? "text-teal-600" : "text-rose-500"
                          }`}
                        >
                          {connected ? "Connected" : "Disconnected"}
                        </span>
                      </div>
                    </div>

                    <span className="whitespace-nowrap text-xs text-slate-400">
                      {new Date(worker.lastHeartbeat).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Execution"
          title="Worker Activity"
          description="Detailed worker status and heartbeat information."
        />

        <Workers />
      </section>

      <section>
        <SectionHeader
          eyebrow="Activity"
          title="Recent Executions"
          description="Latest job execution activity."
        />

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          {recentRuns.length === 0 ? (
            <EmptySection
              icon={<Activity size={18} />}
              iconBackground="bg-indigo-50"
              iconColor="text-indigo-500"
              title="No executions yet"
              description="Execution activity will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between gap-5 px-5 py-4 transition-colors hover:bg-indigo-50/30"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                      <Activity size={16} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-slate-800">
                        {run.job.name}
                      </h3>

                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        Worker: {run.workerId ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <StatusBadge status={run.status} />

                    <p className="mt-1.5 text-[11px] text-slate-400">
                      {new Date(run.startedAt).toLocaleString()}
                    </p>

                    {run.duration != null && (
                      <p className="text-[11px] text-slate-400">
                        {run.duration} ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Attention"
          title="Recent Failed Jobs"
          description="Latest jobs that failed during execution."
        />

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          {recentFails.length === 0 ? (
            <EmptySection
              icon={<CheckCircle2 size={18} />}
              iconBackground="bg-teal-50"
              iconColor="text-teal-600"
              title="No failed jobs"
              description="All recent jobs completed without failure."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentFails.map((job) => (
                <div
                  key={job.id}
                  className="flex items-start justify-between gap-5 px-5 py-4 transition-colors hover:bg-rose-50/30"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                      <XCircle size={17} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-slate-800">
                        {job.job.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {job.reason}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                        <span>
                          Attempts:{" "}
                          <span className="font-medium text-slate-600">
                            {job.attempts}
                          </span>
                        </span>

                        <span>{new Date(job.failedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <StatusBadge status="FAILED" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PremiumCard({
  title,
  value,
  icon,
  iconBackground,
  iconColor,
  valueColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBackground: string;
  iconColor: string;
  valueColor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
        >
          {icon}
        </div>
      </div>

      <p className={`mt-4 text-2xl font-semibold tracking-tight ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
        {eyebrow}
      </p>

      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function EmptySection({
  icon,
  iconBackground,
  iconColor,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBackground: string;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">{title}</p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}
