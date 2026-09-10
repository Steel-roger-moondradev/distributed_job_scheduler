import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock3, RefreshCw, Zap, AlertCircle } from "lucide-react";
import { ReactNode } from "react";

import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import ErrorState from "../components/ErrorState.js";

interface MetricsData {
  averageExecutionTime: {
    _avg: {
      duration?: number | null;
    };
  };
  successcount: number;
  failcount: number;
  distribution: {
    bucket: string;
    average_duration: number;
  }[];
  jobscount: {
    bucket: string;
    job_count: number;
  }[];
  data: {
    duration_range: string;
    job_count: number;
  }[];
  slowestJobs: {
    id: string;
    jobId: string;
    workerId?: string | null;
    duration: number;
  }[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  iconClassName: string;
  iconBackground: string;
  valueClassName?: string;
}

function MetricCard({
  title,
  value,
  description,
  icon,
  iconClassName,
  iconBackground,
  valueClassName = "text-slate-900",
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBackground} ${iconClassName}`}
        >
          {icon}
        </div>
      </div>

      <p
        className={`mt-4 text-2xl font-semibold tracking-tight ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  description: string;
  accentClassName: string;
  children: ReactNode;
}

function ChartCard({
  title,
  description,
  accentClassName,
  children,
}: ChartCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
      <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
        <div className={`mt-1 h-9 w-1 rounded-full ${accentClassName}`} />

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.10)",
};

export default function MetricsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useQuery<MetricsData>({
      queryKey: ["metrics"],
      queryFn: async () => {
        const response = await api.get("/api/metricsdashboard");
        return response.data;
      },
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

  if (!data) {
    return (
      <ErrorState
        message="Metrics data is unavailable."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const averageExecutionTime = data.averageExecutionTime._avg.duration ?? 0;

  const totalProcessed = data.successcount + data.failcount;

  const successRate =
    totalProcessed > 0
      ? ((data.successcount / totalProcessed) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">
            Analytics
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Performance Metrics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Execution performance and processing insights.
          </p>
        </div>

        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700 transition-all hover:border-indigo-200 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Average Execution"
          value={`${averageExecutionTime.toFixed(2)} ms`}
          description="Average job execution duration"
          icon={<Clock3 size={16} />}
          iconClassName="text-indigo-600"
          iconBackground="bg-indigo-50"
          valueClassName="text-indigo-700"
        />

        <MetricCard
          title="Total Processed"
          value={totalProcessed}
          description="Successful and failed executions"
          icon={<Activity size={16} />}
          iconClassName="text-violet-600"
          iconBackground="bg-violet-50"
          valueClassName="text-violet-700"
        />

        <MetricCard
          title="Successful"
          value={data.successcount}
          description={`${successRate}% success rate`}
          icon={<Zap size={16} />}
          iconClassName="text-teal-600"
          iconBackground="bg-teal-50"
          valueClassName="text-teal-700"
        />

        <MetricCard
          title="Failed"
          value={data.failcount}
          description="Executions that failed"
          icon={<AlertCircle size={16} />}
          iconClassName="text-rose-600"
          iconBackground="bg-rose-50"
          valueClassName="text-rose-700"
        />
      </div>

      <ChartCard
        title="Execution Time Trend"
        description="Average execution time across recent intervals."
        accentClassName="bg-indigo-500"
      >
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={data.distribution}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              stroke="#E8EAF2"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="bucket"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                new Date(value).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />

            <YAxis
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(value) => {
                if (typeof value === "string" || typeof value === "number") {
                  return new Date(value).toLocaleString();
                }

                return String(value);
              }}
            />

            <Line
              type="monotone"
              dataKey="average_duration"
              stroke="#6366F1"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Job Throughput"
          description="Number of jobs processed across recent intervals."
          accentClassName="bg-violet-500"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.jobscount}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                stroke="#E8EAF2"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="bucket"
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip contentStyle={tooltipStyle} />

              <Bar dataKey="job_count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Execution Distribution"
          description="Jobs grouped by execution duration."
          accentClassName="bg-amber-400"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.data}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                stroke="#E8EAF2"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="duration_range"
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip contentStyle={tooltipStyle} />

              <Bar dataKey="job_count" fill="#D6A84F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-9 w-1 rounded-full bg-rose-400" />

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Slowest Jobs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Jobs with the longest execution durations.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600">
            {data.slowestJobs.length} Jobs
          </span>
        </div>

        {data.slowestJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-200 bg-slate-50/70">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Job
                  </th>

                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Worker
                  </th>

                  <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Duration
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.slowestJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="transition-colors hover:bg-indigo-50/30"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium text-indigo-600">
                        {job.jobId}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500">
                        {job.workerId ?? "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {job.duration} ms
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">
              No slow jobs found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              There are no execution records to display.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
