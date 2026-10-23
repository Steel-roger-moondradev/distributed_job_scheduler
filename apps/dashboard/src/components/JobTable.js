import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Eye, Pause, Play, Trash2 } from "lucide-react";
import { formatDate } from "../utils/formatDate.js";
export default function JobTable({ jobs, onView, onPause, onResume, onDelete, }) {
    return (_jsx("div", { className: "overflow-hidden rounded-2xl bg-white", children: _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "min-w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-200 bg-slate-50/70", children: [_jsx("th", { className: "whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400 sm:px-6", children: "Job Name" }), _jsx("th", { className: "whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400", children: "Type" }), _jsx("th", { className: "whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400", children: "Priority" }), _jsx("th", { className: "whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400", children: "Status" }), _jsx("th", { className: "whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400", children: "Next Run" }), _jsx("th", { className: "whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400", children: "Timeout" }), _jsx("th", { className: "whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400", children: "Retries" }), _jsx("th", { className: "whitespace-nowrap px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: jobs.map((job) => {
                                /*
                                 * Job.status controls the job lifecycle.
                                 *
                                 * CRON:
                                 *   ACTIVE -> PAUSED -> ACTIVE
                                 *
                                 * DELAYED:
                                 *   ACTIVE -> PAUSED -> ACTIVE
                                 *
                                 * ONCE:
                                 *   ACTIVE -> COMPLETED
                                 *   PAUSED -> ACTIVE
                                 *
                                 * Terminal states:
                                 *   COMPLETED / FAILED / CANCELLED
                                 *   No pause/resume actions.
                                 */
                                // Only ACTIVE CRON and DELAYED jobs can be paused.
                                // ONCE jobs can never be paused.
                                const canPause = job.status === "ACTIVE" &&
                                    (job.type === "CRON" || job.type === "DELAYED");
                                // Any PAUSED job can be resumed, including ONCE.
                                const canResume = job.status === "PAUSED";
                                return (_jsxs("tr", { className: "group transition-colors hover:bg-indigo-50/20", children: [_jsx("td", { className: "px-5 py-4 sm:px-6", children: _jsxs("div", { className: "max-w-[230px]", children: [_jsx("p", { className: "truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-indigo-700", title: job.name, children: job.name }), _jsx("p", { className: "mt-1 truncate font-mono text-[10px] text-slate-400", title: job.id, children: job.id })] }) }), _jsx("td", { className: "whitespace-nowrap px-5 py-4", children: _jsx("span", { className: "inline-flex rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700", children: job.type }) }), _jsx("td", { className: "px-5 py-4", children: _jsx("span", { className: "text-sm font-medium text-slate-600", children: job.priority }) }), _jsx("td", { className: "whitespace-nowrap px-5 py-4", children: _jsxs("span", { className: `inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${job.status === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : job.status === "PAUSED"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : job.status === "COMPLETED"
                                                            ? "bg-blue-50 text-blue-700"
                                                            : job.status === "FAILED"
                                                                ? "bg-rose-50 text-rose-700"
                                                                : "bg-slate-100 text-slate-600"}`, children: [_jsx("span", { className: `mr-1.5 h-1.5 w-1.5 rounded-full ${job.status === "ACTIVE"
                                                            ? "bg-emerald-500"
                                                            : job.status === "PAUSED"
                                                                ? "bg-amber-500"
                                                                : job.status === "COMPLETED"
                                                                    ? "bg-blue-500"
                                                                    : job.status === "FAILED"
                                                                        ? "bg-rose-500"
                                                                        : "bg-slate-400"}` }), job.status] }) }), _jsx("td", { className: "whitespace-nowrap px-5 py-4 text-sm text-slate-500", children: job.nextRunAt ? formatDate(job.nextRunAt) : "—" }), _jsx("td", { className: "whitespace-nowrap px-5 py-4", children: _jsxs("span", { className: "font-mono text-xs font-medium text-slate-500", children: [job.timeoutMs / 1000, "s"] }) }), _jsx("td", { className: "px-5 py-4", children: _jsx("span", { className: "inline-flex min-w-8 items-center justify-center rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700", children: job.maxRetries }) }), _jsx("td", { className: "px-5 py-4", children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [_jsx("button", { onClick: () => onView(job.id), "aria-label": `View ${job.name}`, title: "View job", className: "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95", children: _jsx(Eye, { size: 16, strokeWidth: 1.8 }) }), canPause && (_jsx("button", { onClick: () => onPause(job.id), "aria-label": `Pause ${job.name}`, title: "Pause job", className: "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-600 active:scale-95", children: _jsx(Pause, { size: 16, strokeWidth: 1.8 }) })), canResume && (_jsx("button", { onClick: () => onResume(job.id), "aria-label": `Resume ${job.name}`, title: "Resume job", className: "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-teal-50 hover:text-teal-600 active:scale-95", children: _jsx(Play, { size: 16, strokeWidth: 1.8 }) })), _jsx("button", { onClick: () => onDelete(job.id), "aria-label": `Delete ${job.name}`, title: "Delete job", className: "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95", children: _jsx(Trash2, { size: 16, strokeWidth: 1.8 }) })] }) })] }, job.id));
                            }) })] }), jobs.length === 0 && (_jsxs("div", { className: "flex flex-col items-center justify-center border-t border-slate-100 px-6 py-16", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400", children: _jsx(Eye, { size: 20, strokeWidth: 1.7 }) }), _jsx("p", { className: "mt-4 text-sm font-semibold text-slate-700", children: "No jobs found" }), _jsx("p", { className: "mt-1.5 text-xs text-slate-400", children: "Create a job to start scheduling work." })] }))] }) }));
}
