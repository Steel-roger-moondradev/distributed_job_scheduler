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
    <div className="flex flex-col md:flex-row gap-2 mb-4">
      <input
        type="text"
        placeholder="Search by job name..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="PAUSED">Paused</option>
        <option value="RUNNING">Running</option>
        <option value="QUEUED">Queued</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="FAILED">Failed</option>
      </select>
      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        <option value="">All Types</option>
        <option value="CRON">Cron</option>
        <option value="ONCE">ONCE</option>
      </select>
    </div>
  );
}