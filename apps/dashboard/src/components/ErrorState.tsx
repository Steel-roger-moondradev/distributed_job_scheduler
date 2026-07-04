import React from "react";
import { RefreshCcw } from "lucide-react";

interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-red-600">
      <RefreshCcw size={32} className="mb-4 animate-spin" />
      <p className="mb-2 font-medium">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Retry
      </button>
    </div>
  );
}
