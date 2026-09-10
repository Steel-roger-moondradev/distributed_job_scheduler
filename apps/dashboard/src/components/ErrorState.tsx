import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {/* Error icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle size={20} strokeWidth={1.8} />
      </div>

      {/* Message */}
      <p className="mt-4 max-w-md text-sm font-medium text-slate-700">
        {message}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Something went wrong while loading this data.
      </p>

      {/* Retry */}
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
      >
        <RefreshCcw size={15} strokeWidth={1.8} />
        Retry
      </button>
    </div>
  );
}
