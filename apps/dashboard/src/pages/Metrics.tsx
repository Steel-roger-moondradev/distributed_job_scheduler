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
import api from "../api/client.js";

export default function MetricsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const res = await api.get("/api/metricsdashboard");
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading metrics...</div>;
  }

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-blue-600 font-semibold">
          Analytics
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          Performance Metrics
        </h1>

        <p className="mt-2 text-slate-500">
          Execution performance and processing insights
        </p>
      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm hover:shadow-xl transition-all duration-300">
          {" "}
          <p className="text-gray-500 text-sm">Average Execution Time</p>
          <h2 className="text-3xl font-bold mt-2">
            {data.averageExecutionTime._avg.duration?.toFixed(2) ?? 0} ms
          </h2>
        </div>

        <div className="group rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm hover:shadow-xl transition-all duration-300">
          {" "}
          <p className="text-gray-500 text-sm">Total Processed Jobs</p>
          <h2 className="text-3xl font-bold mt-2">
            {data.successcount + data.failcount}
          </h2>
        </div>
      </div>

      {/* Execution Time Trend */}

      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-lg font-semibold mb-5">Execution Time Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.distribution}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="bucket"
              tickFormatter={(value) =>
                new Date(value).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="average_duration"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#2563EB",
              }}
              activeDot={{
                r: 7,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Throughput */}

      <div
        className="rounded-2xl
border
border-slate-200
bg-white
p-6
shadow-sm
transition
hover:shadow-lg"
      >
        <h2 className="text-lg font-semibold mb-5">Job Throughput</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.jobscount}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis stroke="#64748B" dataKey="bucket" />

            <YAxis />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                boxShadow: "0 10px 25px rgba(0,0,0,.08)",
              }}
            />

            <Bar dataKey="job_count" fill="#10B981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Execution Time Trend
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Average execution time over time
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.data}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis stroke="#64748B" dataKey="duration_range" />
            <YAxis />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #CBD5E1",
                boxShadow: "0 10px 25px rgba(0,0,0,.08)",
              }}
            />
            <Bar dataKey="job_count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Slow Jobs */}

      <div
        className="rounded-2xl
border
border-slate-200
bg-white
shadow-sm
overflow-hidden"
      >
        <div className="border-b bg-gradient-to-r from-slate-50 to-white p-5">
          {" "}
          <h2 className="text-lg font-semibold">Slowest Jobs</h2>
        </div>

        <table className="w-full">
          <thead className="bg-slate-100 text-slate-700">
            {" "}
            <tr
              className="
border-t
transition-colors
hover:bg-blue-50
"
            >
              <th className="text-left p-3">Job</th>

              <th className="text-left p-3">Worker</th>

              <th className="text-right p-3">Duration</th>
            </tr>
          </thead>

          <tbody>
            {data.slowestJobs.map((job: any) => (
              <tr key={job.id} className="border-t">
                <td className="p-3">
                  <span className="font-mono text-blue-700">{job.jobId}</span>
                </td>
                <td className="p-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {job.workerId ?? "-"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                    {job.duration} ms
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
