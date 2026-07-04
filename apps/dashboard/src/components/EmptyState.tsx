import React from "react";

interface Props {
  message?: string;
}

export default function EmptyState({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <svg
        className="w-16 h-16 mb-4 text-gray-300"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6M9 9h6"
        />
      </svg>
      <p className="text-lg">{message ?? "No data found."}</p>
    </div>
  );
}
