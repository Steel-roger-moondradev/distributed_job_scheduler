import { useEffect, useState } from "react";
import {
  Activity,
  Clock3,
  Wifi,
  WifiOff,
  Server,
  RefreshCw,
} from "lucide-react";

import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.js";

type Worker = {
  workerId: string;
  status: "connected" | "disconnected";
  heartbeat: string | null;
};

function formatHeartbeat(heartbeat: string | null) {
  if (!heartbeat) return "No heartbeat";

  const timestamp = Number(heartbeat);

  if (Number.isNaN(timestamp)) {
    return new Date(heartbeat).toLocaleString();
  }

  return new Date(timestamp).toLocaleString();
}

export function Workers() {
  const [activeWorkers, setActiveWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const { data } = await api.get("/api/worker");
        setActiveWorkers(data);
      } catch {
        setActiveWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchWorkers();

    const interval = setInterval(() => {
      void fetchWorkers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (activeWorkers.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
          <Server size={23} strokeWidth={1.8} />
        </div>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
          Worker Infrastructure
        </p>

        <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-800">
          No workers available
        </h3>

        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
          No worker nodes are currently connected to the scheduler.
        </p>
      </section>
    );
  }

  const connectedWorkers = activeWorkers.filter(
    (worker) => worker.status === "connected",
  ).length;

  const disconnectedWorkers = activeWorkers.length - connectedWorkers;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-teal-50/30 px-6 py-5 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Activity size={18} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
                Infrastructure
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                Workers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Worker nodes connected to the scheduler.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              {connectedWorkers} Online
            </div>

            {disconnectedWorkers > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {disconnectedWorkers} Offline
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2">
        {activeWorkers.map((worker) => {
          const connected = worker.status === "connected";

          return (
            <div
              key={worker.workerId}
              className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                connected
                  ? "border-teal-100 bg-teal-50/20 hover:border-teal-200 hover:shadow-[0_8px_24px_rgba(13,148,136,0.08)]"
                  : "border-amber-100 bg-amber-50/20 hover:border-amber-200 hover:shadow-[0_8px_24px_rgba(214,168,79,0.08)]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        connected
                          ? "bg-teal-50 text-teal-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-800">
                        {worker.workerId}
                      </h3>

                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                        Worker node
                      </p>
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    connected
                      ? "bg-teal-50 text-teal-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      connected ? "bg-teal-500" : "bg-amber-500"
                    }`}
                  />

                  {connected ? "Online" : "Offline"}
                </span>
              </div>

              <div className="mt-5 border-t border-slate-200/70 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                    <Clock3 size={13} />
                    Last Heartbeat
                  </div>

                  <span className="text-right text-xs font-medium text-slate-600">
                    {formatHeartbeat(worker.heartbeat)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-6 py-3.5 sm:px-7">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw size={12} />
          Automatically refreshed every 5 seconds
        </div>

        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-300 sm:block">
          Live
        </span>
      </div>
    </section>
  );
}
