import React from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobName?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  jobName,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Delete Job</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X size={18} />
          </button>
        </div>
        <p className="mb-4">
          Are you sure you want to delete{" "}
          <span className="font-medium">{jobName}</span>? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
