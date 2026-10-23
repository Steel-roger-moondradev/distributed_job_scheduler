import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Server, XCircle, Layers3, PlayCircle, AlertTriangle, } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useJobs } from "../hooks/useJobs.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import { HealthCard } from "../components/healthcard.js";
import StatusBadge from "../components/StatusBadge.js";
import api from "../api/client.js";
import { Workers } from "./WorkerPage.js";
export default function DashboardPage() {
    const [healthstatus, setHealthStatus] = useState();
    const [workerStatus, setWorkerStatus] = useState([]);
    const [recentRuns, setRecentRuns] = useState([]);
    const [recentFails, setRecentFails] = useState([]);
    const { data: jobs, isLoading, isError, error, refetch } = useJobs();
    const { data: queueSize } = useQuery({
        queryKey: ["queue-size"],
        queryFn: async () => {
            const { data } = await api.get("/jobs/dashboard");
            return data;
        },
    });
    useEffect(() => {
        api
            .get("/jobs/job-runs/recent")
            .then((res) => setRecentRuns(res.data))
            .catch(() => setRecentRuns([]));
    }, []);
    useEffect(() => {
        api
            .get("/jobs/job-fails/recent")
            .then((res) => setRecentFails(res.data))
            .catch(() => setRecentFails([]));
    }, []);
    useEffect(() => {
        api
            .get("/health")
            .then((res) => setHealthStatus(res.data))
            .catch(() => setHealthStatus(undefined));
    }, []);
    useEffect(() => {
        api
            .get("/workers")
            .then((res) => setWorkerStatus(res.data))
            .catch(() => setWorkerStatus([]));
    }, []);
    if (isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (isError) {
        return (_jsx(ErrorState, { message: error instanceof Error ? error.message : "Failed to load dashboard", onRetry: () => {
                void refetch();
            } }));
    }
    if (!jobs) {
        return _jsx(EmptyState, {});
    }
    const total = jobs.length;
    const active = jobs.filter((job) => job.status === "ACTIVE").length;
    const running = recentRuns.filter((run) => run.status === "RUNNING").length;
    const failed = recentRuns.filter((run) => run.status === "FAILED").length;
    const connectedWorkers = workerStatus.filter((worker) => worker.status === "connected").length;
    const healthItems = [
        {
            title: "API",
            connected: healthstatus?.api === "connected",
            description: healthstatus?.api === "connected"
                ? "Express server responding"
                : "API unavailable",
        },
        {
            title: "Redis",
            connected: healthstatus?.redis === "connected",
            description: healthstatus?.redis === "connected"
                ? "BullMQ connected"
                : "Redis disconnected",
        },
        {
            title: "PostgreSQL",
            connected: healthstatus?.database === "connected",
            description: healthstatus?.database === "connected"
                ? "Prisma connected"
                : "Database unavailable",
        },
        {
            title: "Scheduler",
            connected: healthstatus?.scheduler === "connected",
            description: healthstatus?.scheduler === "connected"
                ? "Heartbeat received"
                : "Heartbeat missing",
        },
    ];
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { children: [_jsxs("div", { className: "mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", children: [_jsx(SectionHeader, { eyebrow: "Overview", title: "Queue Overview", description: "Current state of scheduled and running jobs." }), _jsxs("div", { className: "flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-indigo-500" }), "Scheduler Active"] })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-5", children: [_jsx(PremiumCard, { title: "Total Jobs", value: total, icon: _jsx(Layers3, { size: 17 }), iconBackground: "bg-indigo-50", iconColor: "text-indigo-600", valueColor: "text-indigo-700" }), _jsx(PremiumCard, { title: "Active Jobs", value: active, icon: _jsx(CheckCircle2, { size: 17 }), iconBackground: "bg-teal-50", iconColor: "text-teal-600", valueColor: "text-teal-700" }), _jsx(PremiumCard, { title: "Running Jobs", value: running, icon: _jsx(PlayCircle, { size: 17 }), iconBackground: "bg-amber-50", iconColor: "text-amber-600", valueColor: "text-amber-700" }), _jsx(PremiumCard, { title: "Failed Jobs", value: failed, icon: _jsx(AlertTriangle, { size: 17 }), iconBackground: "bg-rose-50", iconColor: "text-rose-600", valueColor: "text-rose-700" }), _jsx(PremiumCard, { title: "Queue Size", value: queueSize ?? 0, icon: _jsx(Activity, { size: 17 }), iconBackground: "bg-violet-50", iconColor: "text-violet-600", valueColor: "text-violet-700" })] })] }), _jsxs("section", { children: [_jsx(SectionHeader, { eyebrow: "Infrastructure", title: "System Health", description: "Current availability of scheduler infrastructure." }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: healthItems.map((item) => (_jsx(HealthCard, { title: item.title, status: item.connected ? "healthy" : "error", description: item.description }, item.title))) })] }), _jsxs("section", { children: [_jsxs("div", { className: "mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", children: [_jsx(SectionHeader, { eyebrow: "Infrastructure", title: "Workers", description: "Connected workers and their latest heartbeat." }), _jsxs("span", { className: `inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${connectedWorkers === workerStatus.length &&
                                    workerStatus.length > 0
                                    ? "bg-teal-50 text-teal-700"
                                    : "bg-amber-50 text-amber-700"}`, children: [_jsx("span", { className: `h-1.5 w-1.5 rounded-full ${connectedWorkers === workerStatus.length &&
                                            workerStatus.length > 0
                                            ? "bg-teal-500"
                                            : "bg-amber-500"}` }), connectedWorkers, "/", workerStatus.length, " Active"] })] }), _jsx("div", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: workerStatus.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center px-6 py-14 text-center", children: [_jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500", children: _jsx(Server, { size: 20 }) }), _jsx("p", { className: "mt-4 text-sm font-semibold text-slate-800", children: "No workers connected" }), _jsx("p", { className: "mt-1 text-xs text-slate-400", children: "Start a worker to begin processing jobs." })] })) : (_jsx("div", { className: "divide-y divide-slate-100", children: workerStatus.map((worker) => {
                                const connected = worker.status === "connected";
                                return (_jsxs("div", { className: "flex items-center justify-between gap-5 px-5 py-4 transition-colors hover:bg-indigo-50/30", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsx("span", { className: `h-2 w-2 shrink-0 rounded-full ${connected ? "bg-teal-500" : "bg-rose-400"}` }), _jsxs("div", { className: "min-w-0", children: [_jsx("span", { className: "block truncate text-sm font-medium text-slate-700", children: worker.id }), _jsx("span", { className: `text-[11px] ${connected ? "text-teal-600" : "text-rose-500"}`, children: connected ? "Connected" : "Disconnected" })] })] }), _jsx("span", { className: "whitespace-nowrap text-xs text-slate-400", children: new Date(worker.lastHeartbeat).toLocaleTimeString() })] }, worker.id));
                            }) })) })] }), _jsxs("section", { children: [_jsx(SectionHeader, { eyebrow: "Execution", title: "Worker Activity", description: "Detailed worker status and heartbeat information." }), _jsx(Workers, {})] }), _jsxs("section", { children: [_jsx(SectionHeader, { eyebrow: "Activity", title: "Recent Executions", description: "Latest job execution activity." }), _jsx("div", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: recentRuns.length === 0 ? (_jsx(EmptySection, { icon: _jsx(Activity, { size: 18 }), iconBackground: "bg-indigo-50", iconColor: "text-indigo-500", title: "No executions yet", description: "Execution activity will appear here." })) : (_jsx("div", { className: "divide-y divide-slate-100", children: recentRuns.map((run) => (_jsxs("div", { className: "flex items-center justify-between gap-5 px-5 py-4 transition-colors hover:bg-indigo-50/30", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500", children: _jsx(Activity, { size: 16 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("h3", { className: "truncate text-sm font-medium text-slate-800", children: run.job.name }), _jsxs("p", { className: "mt-0.5 truncate text-xs text-slate-400", children: ["Worker: ", run.workerId ?? "N/A"] })] })] }), _jsxs("div", { className: "shrink-0 text-right", children: [_jsx(StatusBadge, { status: run.status }), _jsx("p", { className: "mt-1.5 text-[11px] text-slate-400", children: new Date(run.startedAt).toLocaleString() }), run.duration != null && (_jsxs("p", { className: "text-[11px] text-slate-400", children: [run.duration, " ms"] }))] })] }, run.id))) })) })] }), _jsxs("section", { children: [_jsx(SectionHeader, { eyebrow: "Attention", title: "Recent Failed Jobs", description: "Latest jobs that failed during execution." }), _jsx("div", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: recentFails.length === 0 ? (_jsx(EmptySection, { icon: _jsx(CheckCircle2, { size: 18 }), iconBackground: "bg-teal-50", iconColor: "text-teal-600", title: "No failed jobs", description: "All recent jobs completed without failure." })) : (_jsx("div", { className: "divide-y divide-slate-100", children: recentFails.map((job) => (_jsxs("div", { className: "flex items-start justify-between gap-5 px-5 py-4 transition-colors hover:bg-rose-50/30", children: [_jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [_jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500", children: _jsx(XCircle, { size: 17 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("h3", { className: "truncate text-sm font-medium text-slate-800", children: job.job.name }), _jsx("p", { className: "mt-1 line-clamp-2 text-sm text-slate-500", children: job.reason }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400", children: [_jsxs("span", { children: ["Attempts:", " ", _jsx("span", { className: "font-medium text-slate-600", children: job.attempts })] }), _jsx("span", { children: new Date(job.failedAt).toLocaleString() })] })] })] }), _jsx(StatusBadge, { status: "FAILED" })] }, job.id))) })) })] })] }));
}
function PremiumCard({ title, value, icon, iconBackground, iconColor, valueColor, }) {
    return (_jsxs("div", { className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400", children: title }), _jsx("div", { className: `flex h-9 w-9 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`, children: icon })] }), _jsx("p", { className: `mt-4 text-2xl font-semibold tracking-tight ${valueColor}`, children: value })] }));
}
function SectionHeader({ eyebrow, title, description, }) {
    return (_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400", children: eyebrow }), _jsx("h2", { className: "text-lg font-semibold tracking-tight text-slate-900", children: title }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: description })] }));
}
function EmptySection({ icon, iconBackground, iconColor, title, description, }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center px-6 py-14 text-center", children: [_jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`, children: icon }), _jsx("p", { className: "mt-4 text-sm font-semibold text-slate-700", children: title }), _jsx("p", { className: "mt-1 text-xs text-slate-400", children: description })] }));
}
