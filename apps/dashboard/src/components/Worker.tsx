import { useState, useEffect } from "react";
type Worker = {
  id: string;
  status: "connected" | "disconnected";
  lastHeartbeat: string;
};

export function Worker() {
  const [worker, setWorker] = useState<Worker | null>(null);
  useEffect(() => {
    const fetchWorkerStatus = async () => {
      try {
        const response = await fetch("/api/worker");
        const workerData = await response.json();
        setWorker(workerData);
      } catch (error) {
        console.error("Error fetching worker status:", error);
      }
    };

    fetchWorkerStatus();
  }, []);

  if (!worker) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        Loading...
      </div>
    );
  }

  const { id, status, lastHeartbeat } = worker;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{id}</h3>

        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            status === "connected"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status === "connected" ? "Online" : "Offline"}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Worker ID</span>
          <span className="font-medium">{id}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span>{status}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Last Heartbeat</span>
          <span>{lastHeartbeat}</span>
        </div>
      </div>
    </div>
  );
}
