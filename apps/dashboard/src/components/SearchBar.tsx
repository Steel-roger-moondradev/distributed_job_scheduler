import { Search } from "lucide-react";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400"
        />

        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 outline-none transition-all hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 sm:min-w-[155px]"
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="PAUSED">Paused</option>
        <option value="RUNNING">Running</option>
        <option value="QUEUED">Queued</option>
        <option value="SUCCESS">Success</option>
        <option value="FAILED">Failed</option>
      </select>

      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 outline-none transition-all hover:border-violet-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-50 sm:min-w-[135px]"
      >
        <option value="">All Types</option>
        <option value="CRON">Cron</option>
        <option value="ONCE">Once</option>
      </select>
    </div>
  );
}
