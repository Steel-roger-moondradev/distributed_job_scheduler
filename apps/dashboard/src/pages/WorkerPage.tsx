import { useState, useEffect } from "react";
import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.js";

type Worker = {
  workerId: string;
  status: "connected" | "disconnected";
  heartbeat: string | null;
};

export function Workers() {
  const [activeWorkers, setActiveWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const { data } = await api.get("/api/worker");
        console.log("Fetched workers:", data);
        setActiveWorkers(data);
      } catch (error) {
        console.error("Error fetching workers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();

    const interval = setInterval(fetchWorkers, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;

  if (activeWorkers.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
        No active workers.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Active Workers</h2>

        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          {activeWorkers.length} Online
        </span>
      </div>

      <div className="space-y-4">
        {activeWorkers.map((worker) => (
          <div
            key={worker.workerId}
            className="rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{worker.workerId}</h3>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Online
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-gray-500">Worker ID</span>
              <span className="font-medium">{worker.workerId}</span>

              <span className="text-gray-500">Last Heartbeat</span>
              <span>
                {worker.heartbeat
                  ? new Date(Number(worker.heartbeat)).toLocaleString()
                  : "--"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
