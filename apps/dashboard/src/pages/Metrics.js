import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock3, RefreshCw, Zap, AlertCircle } from "lucide-react";
import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import ErrorState from "../components/ErrorState.js";
function MetricCard({ title, value, description, icon, iconClassName, iconBackground, valueClassName = "text-slate-900", }) {
    return (_jsxs("div", { className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400", children: title }), _jsx("div", { className: `flex h-9 w-9 items-center justify-center rounded-xl ${iconBackground} ${iconClassName}`, children: icon })] }), _jsx("p", { className: `mt-4 text-2xl font-semibold tracking-tight ${valueClassName}`, children: value }), _jsx("p", { className: "mt-1 text-xs text-slate-400", children: description })] }));
}
function ChartCard({ title, description, accentClassName, children, }) {
    return (_jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: [_jsxs("div", { className: "flex items-start gap-3 border-b border-slate-100 px-6 py-5", children: [_jsx("div", { className: `mt-1 h-9 w-1 rounded-full ${accentClassName}` }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold tracking-tight text-slate-900", children: title }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: description })] })] }), _jsx("div", { className: "p-6", children: children })] }));
}
const tooltipStyle = {
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.10)",
};
export default function MetricsPage() {
    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ["metrics"],
        queryFn: async () => {
            const response = await api.get("/api/metricsdashboard");
            return response.data;
        },
    });
    if (isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (isError) {
        return (_jsx(ErrorState, { message: error.message, onRetry: () => {
                void refetch();
            } }));
    }
    if (!data) {
        return (_jsx(ErrorState, { message: "Metrics data is unavailable.", onRetry: () => {
                void refetch();
            } }));
    }
    const averageExecutionTime = data.averageExecutionTime._avg.duration ?? 0;
    const totalProcessed = data.successcount + data.failcount;
    const successRate = totalProcessed > 0
        ? ((data.successcount / totalProcessed) * 100).toFixed(1)
        : "0.0";
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500", children: "Analytics" }), _jsx("h1", { className: "mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl", children: "Performance Metrics" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Execution performance and processing insights." })] }), _jsxs("button", { onClick: () => void refetch(), disabled: isFetching, className: "inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700 transition-all hover:border-indigo-200 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60", children: [_jsx(RefreshCw, { size: 16, className: isFetching ? "animate-spin" : "" }), "Refresh"] })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [_jsx(MetricCard, { title: "Average Execution", value: `${averageExecutionTime.toFixed(2)} ms`, description: "Average job execution duration", icon: _jsx(Clock3, { size: 16 }), iconClassName: "text-indigo-600", iconBackground: "bg-indigo-50", valueClassName: "text-indigo-700" }), _jsx(MetricCard, { title: "Total Processed", value: totalProcessed, description: "Successful and failed executions", icon: _jsx(Activity, { size: 16 }), iconClassName: "text-violet-600", iconBackground: "bg-violet-50", valueClassName: "text-violet-700" }), _jsx(MetricCard, { title: "Successful", value: data.successcount, description: `${successRate}% success rate`, icon: _jsx(Zap, { size: 16 }), iconClassName: "text-teal-600", iconBackground: "bg-teal-50", valueClassName: "text-teal-700" }), _jsx(MetricCard, { title: "Failed", value: data.failcount, description: "Executions that failed", icon: _jsx(AlertCircle, { size: 16 }), iconClassName: "text-rose-600", iconBackground: "bg-rose-50", valueClassName: "text-rose-700" })] }), _jsx(ChartCard, { title: "Execution Time Trend", description: "Average execution time across recent intervals.", accentClassName: "bg-indigo-500", children: _jsx(ResponsiveContainer, { width: "100%", height: 320, children: _jsxs(LineChart, { data: data.distribution, margin: { top: 5, right: 10, left: 0, bottom: 5 }, children: [_jsx(CartesianGrid, { stroke: "#E8EAF2", strokeDasharray: "4 4", vertical: false }), _jsx(XAxis, { dataKey: "bucket", stroke: "#94A3B8", fontSize: 12, tickLine: false, axisLine: false, tickFormatter: (value) => new Date(value).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }) }), _jsx(YAxis, { stroke: "#94A3B8", fontSize: 12, tickLine: false, axisLine: false }), _jsx(Tooltip, { contentStyle: tooltipStyle, labelFormatter: (value) => {
                                    if (typeof value === "string" || typeof value === "number") {
                                        return new Date(value).toLocaleString();
                                    }
                                    return String(value);
                                } }), _jsx(Line, { type: "monotone", dataKey: "average_duration", stroke: "#6366F1", strokeWidth: 2.5, dot: { r: 3 }, activeDot: { r: 5 } })] }) }) }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [_jsx(ChartCard, { title: "Job Throughput", description: "Number of jobs processed across recent intervals.", accentClassName: "bg-violet-500", children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: data.jobscount, margin: { top: 5, right: 10, left: 0, bottom: 5 }, children: [_jsx(CartesianGrid, { stroke: "#E8EAF2", strokeDasharray: "4 4", vertical: false }), _jsx(XAxis, { dataKey: "bucket", stroke: "#94A3B8", fontSize: 12, tickLine: false, axisLine: false }), _jsx(YAxis, { stroke: "#94A3B8", fontSize: 12, tickLine: false, axisLine: false }), _jsx(Tooltip, { contentStyle: tooltipStyle }), _jsx(Bar, { dataKey: "job_count", fill: "#8B5CF6", radius: [6, 6, 0, 0] })] }) }) }), _jsx(ChartCard, { title: "Execution Distribution", description: "Jobs grouped by execution duration.", accentClassName: "bg-amber-400", children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: data.data, margin: { top: 5, right: 10, left: 0, bottom: 5 }, children: [_jsx(CartesianGrid, { stroke: "#E8EAF2", strokeDasharray: "4 4", vertical: false }), _jsx(XAxis, { dataKey: "duration_range", stroke: "#94A3B8", fontSize: 12, tickLine: false, axisLine: false }), _jsx(YAxis, { stroke: "#94A3B8", fontSize: 12, tickLine: false, axisLine: false }), _jsx(Tooltip, { contentStyle: tooltipStyle }), _jsx(Bar, { dataKey: "job_count", fill: "#D6A84F", radius: [6, 6, 0, 0] })] }) }) })] }), _jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 px-6 py-5", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-1 h-9 w-1 rounded-full bg-rose-400" }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold tracking-tight text-slate-900", children: "Slowest Jobs" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Jobs with the longest execution durations." })] })] }), _jsxs("span", { className: "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600", children: [data.slowestJobs.length, " Jobs"] })] }), data.slowestJobs.length > 0 ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "border-b border-slate-200 bg-slate-50/70", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400", children: "Job" }), _jsx("th", { className: "px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400", children: "Worker" }), _jsx("th", { className: "px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400", children: "Duration" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: data.slowestJobs.map((job) => (_jsxs("tr", { className: "transition-colors hover:bg-indigo-50/30", children: [_jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: "font-mono text-xs font-medium text-indigo-600", children: job.jobId }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: "font-mono text-xs text-slate-500", children: job.workerId ?? "—" }) }), _jsx("td", { className: "px-6 py-4 text-right", children: _jsxs("span", { className: "inline-flex rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700", children: [job.duration, " ms"] }) })] }, job.id))) })] }) })) : (_jsxs("div", { className: "px-6 py-16 text-center", children: [_jsx("p", { className: "text-sm font-medium text-slate-700", children: "No slow jobs found" }), _jsx("p", { className: "mt-1 text-sm text-slate-400", children: "There are no execution records to display." })] }))] })] }));
}
