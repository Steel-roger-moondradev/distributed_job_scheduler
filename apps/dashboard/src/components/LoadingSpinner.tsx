export default function LoadingSpinner() {
  return (
    <div
      className="flex items-center justify-center py-10"
      role="status"
      aria-label="Loading"
    >
      <div className="relative h-6 w-6">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
      </div>
    </div>
  );
}
