import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, BriefcaseBusiness, SlidersHorizontal, } from "lucide-react";
import { toast } from "react-hot-toast";
import { useJobs } from "../hooks/useJobs.js";
import { pauseJob, resumeJob, deleteJob } from "../api/job.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import SearchBar from "../components/SearchBar.js";
import JobTable from "../components/JobTable.js";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.js";
export default function JobsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: jobs, isLoading, isError, error, refetch, isFetching, } = useJobs();
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    // ============================================================
    // PAUSE
    // Only ACTIVE CRON and DELAYED jobs can be paused.
    // ONCE jobs can never be paused.
    // ============================================================
    const handlePause = async (id) => {
        const job = jobs?.find((job) => job.id === id);
        if (!job ||
            job.status !== "ACTIVE" ||
            (job.type !== "CRON" && job.type !== "DELAYED")) {
            return;
        }
        const toastId = toast.loading("Pausing job...");
        try {
            await pauseJob(id);
            await queryClient.invalidateQueries({
                queryKey: ["jobs"],
            });
            toast.success("Job paused", {
                id: toastId,
            });
        }
        catch {
            toast.error("Failed to pause job", {
                id: toastId,
            });
        }
    };
    // ============================================================
    // RESUME
    // Any PAUSED job can be resumed, including ONCE.
    // ============================================================
    const handleResume = async (id) => {
        const job = jobs?.find((job) => job.id === id);
        if (!job || job.status !== "PAUSED") {
            return;
        }
        const toastId = toast.loading("Resuming job...");
        try {
            await resumeJob(id);
            await queryClient.invalidateQueries({
                queryKey: ["jobs"],
            });
            toast.success("Job resumed", {
                id: toastId,
            });
        }
        catch {
            toast.error("Failed to resume job", {
                id: toastId,
            });
        }
    };
    // ============================================================
    // DELETE
    // ============================================================
    const handleDelete = async () => {
        if (!deleteId)
            return;
        const toastId = toast.loading("Deleting job...");
        try {
            await deleteJob(deleteId);
            await queryClient.invalidateQueries({
                queryKey: ["jobs"],
            });
            toast.success("Job deleted", {
                id: toastId,
            });
        }
        catch {
            toast.error("Failed to delete job", {
                id: toastId,
            });
        }
        finally {
            setDeleteId(null);
        }
    };
    // ============================================================
    // FILTERS
    // ============================================================
    const filteredJobs = jobs?.filter((job) => {
        const matchesSearch = job.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter ? job.type === typeFilter : true;
        return matchesSearch && matchesType;
    });
    // ============================================================
    // LOADING
    // ============================================================
    if (isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    // ============================================================
    // ERROR
    // ============================================================
    if (isError) {
        return (_jsx(ErrorState, { message: error.message, onRetry: () => {
                void refetch();
            } }));
    }
    // ============================================================
    // EMPTY
    // ============================================================
    if (!jobs || jobs.length === 0) {
        return _jsx(EmptyState, { message: "No jobs found." });
    }
    const filteredCount = filteredJobs?.length ?? 0;
    const hasFilters = Boolean(search || typeFilter);
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500", children: "Job Management" }), _jsx("h1", { className: "mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl", children: "Jobs" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Create, monitor, and manage your scheduled jobs." })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("button", { onClick: () => void refetch(), disabled: isFetching, className: "inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2.5 text-sm font-medium text-indigo-700 transition-all hover:border-indigo-200 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60", children: [_jsx(RefreshCw, { size: 16, className: isFetching ? "animate-spin" : "" }), "Refresh"] }), _jsxs("button", { onClick: () => navigate("/jobs/create"), className: "inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md", children: [_jsx(Plus, { size: 16 }), "Create Job"] })] })] }), _jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: [_jsxs("div", { className: "flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600", children: _jsx(SlidersHorizontal, { size: 17 }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold text-slate-800", children: "Filter Jobs" }), _jsx("p", { className: "mt-0.5 text-xs text-slate-400", children: "Search and filter your jobs." })] })] }), _jsx("div", { className: "p-5 sm:p-6", children: _jsx(SearchBar, { searchTerm: search, onSearchChange: setSearch, typeFilter: typeFilter, onTypeFilterChange: setTypeFilter }) })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600", children: _jsx(BriefcaseBusiness, { size: 16 }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-semibold text-slate-800", children: [filteredCount, " ", filteredCount === 1 ? "job" : "jobs"] }), hasFilters && filteredCount !== jobs.length && (_jsxs("p", { className: "mt-0.5 text-xs text-slate-400", children: ["Filtered from ", jobs.length, " total jobs"] }))] })] }), hasFilters && (_jsx("button", { onClick: () => {
                            setSearch("");
                            setTypeFilter("");
                        }, className: "w-fit text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700", children: "Clear filters" }))] }), _jsx("section", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: _jsx(JobTable, { jobs: filteredJobs ?? [], onView: (id) => navigate(`/jobs/${id}`), onPause: handlePause, onResume: handleResume, onDelete: (id) => setDeleteId(id) }) }), _jsx(ConfirmDeleteModal, { isOpen: !!deleteId, onClose: () => setDeleteId(null), onConfirm: handleDelete, jobName: jobs.find((job) => job.id === deleteId)?.name })] }));
}
