import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "../hooks/useJobs.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
import EmptyState from "../components/EmptyState.js";
import ErrorState from "../components/ErrorState.js";
import SearchBar from "../components/SearchBar.js";
import JobTable from "../components/JobTable.js";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.js";
import { pauseJob, resumeJob, deleteJob } from "../api/job.js";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function JobsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading, isError, error, refetch } = useJobs();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handlePause = async (id: string) => {
    const toastId = toast.loading("Pausing job...");
    try {
      await pauseJob(id);
      toast.success("Job paused", { id: toastId });
      queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });
    } catch (e) {
      toast.error("Failed to pause job", { id: toastId });
    }
  };

  const handleResume = async (id: string) => {
    const toastId = toast.loading("Resuming job...");
    try {
      await resumeJob(id);
      toast.success("Job resumed", { id: toastId });
      queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });
    } catch (e) {
      toast.error("Failed to resume job", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Deleting job...");
    try {
      await deleteJob(deleteId);
      toast.success("Job deleted", { id: toastId });
      queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });
    } catch (e) {
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

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <ErrorState message={(error as any).message} onRetry={refetch} />;
  if (!jobs || jobs.length === 0) return <EmptyState />;

  return (
    <div>
      
      <SearchBar
        searchTerm={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />
      <JobTable
        jobs={filteredJobs ?? []}
        onView={(id) => navigate(`/jobs/${id}`)}
        onPause={handlePause}
        onResume={handleResume}
        onDelete={(id) => {
          setDeleteId(id);
        }}
      />
      <ConfirmDeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        jobName={jobs?.find((j) => j.id === deleteId)?.name}
      />
    </div>
  );
}
