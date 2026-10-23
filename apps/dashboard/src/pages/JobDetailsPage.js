import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pause, Play, Trash2, RefreshCw, Copy, Eye, X, CheckCircle2, Clock3, Zap, RotateCcw, Activity, } from "lucide-react";
import { toast } from "react-hot-toast";
import { useJob } from "../hooks/useJob.js";
import { getJobHistory, pauseJob, resumeJob, deleteJob } from "../api/job.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import StatusBadge from "../components/StatusBadge.js";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.js";
import { formatDate } from "../utils/formatDate.js";
import { formatDuration } from "../utils/formatDuration.js";
import JobStatusBadge from "../components/JobStatusBadge.js";
function InfoCard({ title, icon, children, accent = "indigo" }) {
    const styles = {
        indigo: "bg-indigo-50 text-indigo-600",
        violet: "bg-violet-50 text-violet-600",
        teal: "bg-teal-50 text-teal-600",
        amber: "bg-amber-50 text-amber-600",
    };
    return (_jsxs("div", { className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400", children: [icon, title] }), _jsx("div", { className: `flex h-8 w-8 items-center justify-center rounded-lg ${styles[accent]}`, children: icon || _jsx(Activity, { size: 14 }) })] }), _jsx("div", { className: "mt-4 text-lg font-semibold tracking-tight text-slate-900", children: children })] }));
}
function SectionHeader({ eyebrow, title, description, accent = "indigo", action, }) {
    const colors = {
        indigo: "text-indigo-500",
        violet: "text-violet-500",
        teal: "text-teal-600",
        amber: "text-amber-600",
        rose: "text-rose-500",
    };
    return (_jsxs("div", { className: "flex items-end justify-between gap-4", children: [_jsxs("div", { children: [eyebrow && (_jsx("p", { className: `text-[10px] font-semibold uppercase tracking-[0.2em] ${colors[accent]}`, children: eyebrow })), _jsx("h2", { className: "mt-1 text-lg font-semibold tracking-tight text-slate-900", children: title }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: description })] }), action] }));
}
export default function JobDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showDelete, setShowDelete] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const { data: job, isLoading: jobLoading, isError: jobError, error: jobErr, refetch: refetchJob, } = useJob(id ?? "");
    const { data: history, isLoading: historyLoading, isError: historyError, error: historyErr, refetch: refetchHistory, isFetching: historyFetching, } = useQuery({
        queryKey: ["jobHistory", id],
        queryFn: () => getJobHistory(id).then((response) => response.data),
        enabled: !!id,
        refetchInterval: 5000,
    });
    const refreshAll = () => {
        void refetchJob();
        void refetchHistory();
    };
    const copyPayload = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(job?.payload, null, 2));
            toast.success("Payload copied");
        }
        catch {
            toast.error("Failed to copy payload");
        }
    };
    const copyResult = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(selectedResult, null, 2));
            toast.success("Result copied");
        }
        catch {
            toast.error("Failed to copy result");
        }
    };
    const openResult = (result) => {
        setSelectedResult(result);
        setShowResult(true);
    };
    const closeResult = () => {
        setShowResult(false);
        setSelectedResult(null);
    };
    const handlePause = async () => {
        if (!id)
            return;
        const toastId = toast.loading("Pausing job...");
        try {
            await pauseJob(id);
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["job", id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["jobs"],
                }),
            ]);
            toast.success("Job paused", { id: toastId });
        }
        catch {
            toast.error("Failed to pause job", { id: toastId });
        }
    };
    const handleResume = async () => {
        if (!id)
            return;
        const toastId = toast.loading("Resuming job...");
        try {
            await resumeJob(id);
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["job", id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["jobs"],
                }),
            ]);
            toast.success("Job resumed", { id: toastId });
        }
        catch {
            toast.error("Failed to resume job", { id: toastId });
        }
    };
    const handleDelete = async () => {
        if (!id)
            return;
        const toastId = toast.loading("Deleting job...");
        try {
            await deleteJob(id);
            await queryClient.invalidateQueries({
                queryKey: ["jobs"],
            });
            toast.success("Job deleted", { id: toastId });
            navigate("/jobs");
        }
        catch {
            toast.error("Delete failed", { id: toastId });
        }
        finally {
            setShowDelete(false);
        }
    };
    if (jobLoading || historyLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (jobError) {
        return (_jsx(ErrorState, { message: jobErr.message, onRetry: () => {
                void refetchJob();
            } }));
    }
    if (historyError) {
        return (_jsx(ErrorState, { message: historyErr.message, onRetry: () => {
                void refetchHistory();
            } }));
    }
    if (!job) {
        return _jsx(EmptyState, { message: "Job not found" });
    }
    /*
     * ==========================================================
     * Job lifecycle state
     * ==========================================================
     */
    const isActive = job.status === "ACTIVE";
    const isPaused = job.status === "PAUSED";
    const canPause = isActive && (job.type === "CRON" || job.type === "DELAYED");
    const canResume = isPaused;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-8", children: [_jsx(ConfirmDeleteModal, { isOpen: showDelete, onClose: () => setShowDelete(false), onConfirm: handleDelete, jobName: job.name }), _jsx("section", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]", children: _jsx("div", { className: "bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/50 p-6 sm:p-8", children: _jsxs("div", { className: "flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("button", { onClick: () => navigate(-1), className: "mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600", children: [_jsx(ArrowLeft, { size: 16 }), "Back to Jobs"] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("h1", { className: "break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl", children: job.name }), _jsx(JobStatusBadge, { status: job.status })] }), _jsx("p", { className: "mt-3 max-w-3xl text-sm leading-6 text-slate-500", children: job.description || "No description provided." }), _jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400", children: [_jsx("span", { className: "rounded-md bg-white/80 px-2 py-1 font-mono text-indigo-600 ring-1 ring-slate-200/70", children: job.id }), _jsxs("span", { children: ["Created ", formatDate(job.createdAt)] })] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("button", { onClick: refreshAll, className: "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700", children: [_jsx(RefreshCw, { size: 16, className: historyFetching ? "animate-spin" : "" }), "Refresh"] }), _jsxs("button", { onClick: () => void copyPayload(), className: "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700", children: [_jsx(Copy, { size: 16 }), "Copy Payload"] }), canPause && (_jsxs("button", { onClick: () => void handlePause(), className: "inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100", children: [_jsx(Pause, { size: 16 }), "Pause"] })), canResume && (_jsxs("button", { onClick: () => void handleResume(), className: "inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md", children: [_jsx(Play, { size: 16 }), "Resume"] })), _jsxs("button", { onClick: () => setShowDelete(true), className: "inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-600 transition-all hover:bg-rose-100", children: [_jsx(Trash2, { size: 16 }), "Delete"] })] })] }) }) }), _jsxs("section", { className: "space-y-5", children: [_jsx(SectionHeader, { eyebrow: "Configuration", title: "Overview", description: "General configuration and execution settings.", accent: "indigo" }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [_jsx(InfoCard, { title: "Schedule Type", icon: _jsx(Zap, { size: 13 }), accent: "violet", children: job.type }), _jsx(InfoCard, { title: "Job Type", icon: _jsx(Activity, { size: 13 }), accent: "indigo", children: job.jobtype }), _jsx(InfoCard, { title: "Priority", icon: _jsx(Clock3, { size: 13 }), accent: "amber", children: job.priority }), _jsx(InfoCard, { title: "Status", icon: _jsx(CheckCircle2, { size: 13 }), accent: "teal", children: _jsx("span", { className: job.status === "ACTIVE"
                                                ? "text-teal-600"
                                                : job.status === "PAUSED"
                                                    ? "text-amber-600"
                                                    : job.status === "FAILED"
                                                        ? "text-rose-600"
                                                        : job.status === "COMPLETED"
                                                            ? "text-indigo-600"
                                                            : "text-slate-500", children: job.status }) }), _jsx(InfoCard, { title: "Next Run", accent: "indigo", children: _jsx("span", { className: "text-sm font-medium", children: job.nextRunAt ? formatDate(job.nextRunAt) : "—" }) }), _jsxs(InfoCard, { title: "Timeout", icon: _jsx(Clock3, { size: 13 }), accent: "amber", children: [job.timeoutMs / 1000, "s"] }), _jsx(InfoCard, { title: "Max Retries", icon: _jsx(RotateCcw, { size: 13 }), accent: "violet", children: job.maxRetries }), _jsx(InfoCard, { title: "Created", accent: "teal", children: _jsx("span", { className: "text-sm font-medium", children: formatDate(job.createdAt) }) })] })] }), _jsxs("section", { className: "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] sm:p-7", children: [_jsx(SectionHeader, { eyebrow: "Details", title: "Metadata", description: "Additional information and scheduling details.", accent: "violet" }), _jsxs("div", { className: "mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2", children: [_jsx(MetadataItem, { label: "Job Type", value: job.jobtype }), _jsx(MetadataItem, { label: "Schedule Type", value: job.type }), _jsx(MetadataItem, { label: "Status", value: job.status }), _jsx(MetadataItem, { label: "Cron Expression", value: job.cronExpression || "—", mono: true }), _jsx(MetadataItem, { label: "Next Run", value: job.nextRunAt ? formatDate(job.nextRunAt) : "—" }), _jsx(MetadataItem, { label: "Updated At", value: formatDate(job.updatedAt) }), _jsx(MetadataItem, { label: "Description", value: job.description || "No description" }), _jsx(MetadataItem, { label: "Job ID", value: job.id, mono: true })] })] }), _jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: [_jsxs("div", { className: "flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between", children: [_jsx(SectionHeader, { eyebrow: "Request", title: "Payload", description: "JSON payload that will be sent to the worker.", accent: "indigo" }), _jsxs("button", { onClick: () => void copyPayload(), className: "inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100", children: [_jsx(Copy, { size: 15 }), "Copy"] })] }), _jsxs("div", { className: "overflow-x-auto bg-slate-950", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 px-6 py-3", children: [_jsx("span", { className: "text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500", children: "Job Payload" }), _jsx("span", { className: "font-mono text-[10px] text-slate-600", children: "JSON" })] }), _jsx("pre", { className: "max-h-[500px] overflow-auto p-6 font-mono text-xs leading-6 text-slate-300", children: _jsx("code", { children: JSON.stringify(job.payload, null, 2) }) })] })] }), _jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: [_jsxs("div", { className: "flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between", children: [_jsx(SectionHeader, { eyebrow: "Runtime", title: "Execution History", description: "Recent executions of this job.", accent: "teal" }), _jsxs("span", { className: "inline-flex w-fit items-center rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700", children: [history?.length ?? 0, " ", (history?.length ?? 0) === 1 ? "Run" : "Runs"] })] }), history && history.length > 0 ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "border-b border-slate-200 bg-slate-50/70", children: _jsx("tr", { children: [
                                                    "Started",
                                                    "Finished",
                                                    "Duration",
                                                    "Worker",
                                                    "Attempts",
                                                    "Status",
                                                    "Result",
                                                ].map((heading) => (_jsx("th", { className: "whitespace-nowrap px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400", children: heading }, heading))) }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: history.map((run) => (_jsxs("tr", { className: "transition-colors hover:bg-indigo-50/20", children: [_jsx("td", { className: "whitespace-nowrap px-6 py-4 text-sm text-slate-600", children: formatDate(run.startedAt) }), _jsx("td", { className: "whitespace-nowrap px-6 py-4 text-sm text-slate-500", children: run.finishedAt ? formatDate(run.finishedAt) : "—" }), _jsx("td", { className: "whitespace-nowrap px-6 py-4", children: _jsx("span", { className: "rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700", children: run.duration != null
                                                                ? formatDuration(run.duration)
                                                                : "—" }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "max-w-[180px] truncate font-mono text-xs text-slate-500", title: run.workerId ?? undefined, children: run.workerId ?? "—" }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: "inline-flex min-w-7 justify-center rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700", children: run.attempts }) }), _jsx("td", { className: "px-6 py-4", children: _jsx(StatusBadge, { status: run.status }) }), _jsx("td", { className: "px-6 py-4", children: run.result != null ? (_jsxs("button", { onClick: () => openResult(run.result), className: "inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition-all hover:bg-indigo-100", children: [_jsx(Eye, { size: 14 }), "View Result"] })) : (_jsx("span", { className: "text-sm text-slate-300", children: "\u2014" })) })] }, run.id))) })] }) })) : (_jsxs("div", { className: "flex flex-col items-center justify-center px-6 py-20 text-center", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100", children: _jsx(Clock3, { size: 22, className: "text-slate-400" }) }), _jsx("h3", { className: "mt-4 text-sm font-semibold text-slate-800", children: "No execution history" }), _jsx("p", { className: "mt-1.5 text-sm text-slate-500", children: "This job hasn't been executed yet." })] }))] })] }), showResult && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm", onClick: closeResult, children: _jsxs("div", { className: "w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]", onClick: (event) => event.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 px-6 py-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-600", children: "Execution" }), _jsx("h2", { className: "mt-1 text-lg font-semibold tracking-tight text-slate-900", children: "Execution Result" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Response returned by the job handler." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => void copyResult(), className: "inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100", children: [_jsx(Copy, { size: 15 }), "Copy"] }), _jsx("button", { onClick: closeResult, "aria-label": "Close result", className: "rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700", children: _jsx(X, { size: 19 }) })] })] }), _jsxs("div", { className: "max-h-[70vh] overflow-auto bg-slate-950", children: [_jsx("div", { className: "border-b border-slate-800 px-6 py-3", children: _jsx("span", { className: "text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500", children: "Response" }) }), _jsx("pre", { className: "whitespace-pre-wrap break-words p-6 font-mono text-xs leading-6 text-slate-300", children: JSON.stringify(selectedResult, null, 2) })] })] }) }))] }));
}
function MetadataItem({ label, value, mono = false, }) {
    return (_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400", children: label }), _jsx("p", { className: `mt-1.5 text-sm text-slate-700 ${mono ? "break-all font-mono text-xs" : "font-medium"}`, children: value })] }));
}
