import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  RefreshCw,
  BriefcaseBusiness,
  SlidersHorizontal,
} from "lucide-react";
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

  const {
    data: jobs,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useJobs();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handlePause = async (id: string) => {
    const toastId = toast.loading("Pausing job...");

    try {
      await pauseJob(id);

      await queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });

      toast.success("Job paused", { id: toastId });
    } catch {
      toast.error("Failed to pause job", { id: toastId });
    }
  };

  const handleResume = async (id: string) => {
    const toastId = toast.loading("Resuming job...");

    try {
      await resumeJob(id);

      await queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });

      toast.success("Job resumed", { id: toastId });
    } catch {
      toast.error("Failed to resume job", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const toastId = toast.loading("Deleting job...");

    try {
      await deleteJob(deleteId);

      await queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });

      toast.success("Job deleted", { id: toastId });
    } catch {
      toast.error("Failed to delete job", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch = job.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter ? job.status === statusFilter : true;

    const matchesType = typeFilter ? job.type === typeFilter : true;

    return matchesSearch && matchesStatus && matchesType;
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

  if (!jobs || jobs.length === 0) {
    return <EmptyState message="No jobs found." />;
  }

  const filteredCount = filteredJobs?.length ?? 0;
  const hasFilters = Boolean(search || statusFilter || typeFilter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">
            Job Management
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Jobs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create, monitor, and manage your scheduled jobs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2.5 text-sm font-medium text-indigo-700 transition-all hover:border-indigo-200 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => navigate("/jobs/create")}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
          >
            <Plus size={16} />
            Create Job
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <SlidersHorizontal size={17} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Filter Jobs
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Search and filter your scheduled jobs.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <SearchBar
            searchTerm={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <BriefcaseBusiness size={16} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {filteredCount} {filteredCount === 1 ? "job" : "jobs"}
            </p>

            {hasFilters && filteredCount !== jobs.length && (
              <p className="mt-0.5 text-xs text-slate-400">
                Filtered from {jobs.length} total jobs
              </p>
            )}
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setTypeFilter("");
            }}
            className="w-fit text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700"
          >
            Clear filters
          </button>
        )}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <JobTable
          jobs={filteredJobs ?? []}
          onView={(id) => navigate(`/jobs/${id}`)}
          onPause={handlePause}
          onResume={handleResume}
          onDelete={(id) => setDeleteId(id)}
        />
      </section>

      <ConfirmDeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        jobName={jobs.find((job) => job.id === deleteId)?.name}
      />
    </div>
  );
}
