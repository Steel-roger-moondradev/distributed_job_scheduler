import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Eye } from "lucide-react";
const failedJobs = [
    {
        id: "1",
        jobId: "job_12345",
        reason: "Connection timeout",
        attempts: 3,
        failedAt: "2026-07-05 14:22",
    },
    {
        id: "2",
        jobId: "job_67890",
        reason: "SMTP Authentication Failed",
        attempts: 3,
        failedAt: "2026-07-05 15:10",
    },
];
export default function FailedJobs() {
    return (_jsxs("div", { className: "rounded-xl border border-slate-200 bg-white", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-lg font-semibold tracking-tight text-slate-900", children: "Failed Jobs" }), _jsx("p", { className: "mt-0.5 text-sm text-slate-400", children: "Jobs that failed during execution" })] }), _jsxs("span", { className: "rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600", children: [failedJobs.length, " Failed"] })] }), _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "min-w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-100 bg-slate-50/70", children: [_jsx("th", { className: "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400", children: "Job ID" }), _jsx("th", { className: "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400", children: "Reason" }), _jsx("th", { className: "px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400", children: "Attempts" }), _jsx("th", { className: "px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400", children: "Failed At" }), _jsx("th", { className: "px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400", children: "Action" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: failedJobs.map((job) => (_jsxs("tr", { className: "transition-colors hover:bg-slate-50/60", children: [_jsx("td", { className: "whitespace-nowrap px-5 py-4", children: _jsx("span", { className: "font-mono text-sm font-medium text-slate-700", children: job.jobId }) }), _jsx("td", { className: "px-5 py-4", children: _jsx("span", { className: "text-sm text-slate-600", children: job.reason }) }), _jsx("td", { className: "px-5 py-4 text-center", children: _jsx("span", { className: "inline-flex min-w-8 items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600", children: job.attempts }) }), _jsx("td", { className: "whitespace-nowrap px-5 py-4 text-center text-sm text-slate-500", children: job.failedAt }), _jsx("td", { className: "px-5 py-4 text-center", children: _jsx("button", { "aria-label": `View ${job.jobId}`, title: "View job", className: "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900", children: _jsx(Eye, { size: 16, strokeWidth: 1.8 }) }) })] }, job.id))) })] }), failedJobs.length === 0 && (_jsxs("div", { className: "flex flex-col items-center justify-center px-6 py-16", children: [_jsx("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600", children: "\u2713" }), _jsx("p", { className: "text-sm font-medium text-slate-700", children: "No failed jobs" }), _jsx("p", { className: "mt-1 text-xs text-slate-400", children: "All jobs are running successfully." })] }))] })] }));
}
