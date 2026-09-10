import { useNavigate } from "react-router-dom";
import { RotateCcw, Activity } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const isFetching = useIsFetching();
  const queryClient = useQueryClient();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({
      refetchType: "all",
    });
  };

  useEffect(() => {
    if (isFetching === 0) {
      setLastUpdated(new Date());
    }
  }, [isFetching]);

  const isLoading = isFetching > 0;

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-5 sm:px-6">
      <button
        onClick={() => navigate("/")}
        className="group flex items-center gap-3 text-left"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-all group-hover:bg-indigo-100 group-hover:text-indigo-700">
          <Activity size={17} strokeWidth={1.9} />
        </div>

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
            Control Center
          </p>
          <p className="text-sm font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-700">
            Distributed Job Scheduler
          </p>
        </div>
      </button>

      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 sm:flex">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isLoading ? "animate-pulse bg-amber-500" : "bg-teal-500"
            }`}
          />

          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              {isLoading ? "Updating" : "Last updated"}
            </span>

            <span className="mt-1 text-[11px] font-medium text-slate-600">
              {lastUpdated?.toLocaleTimeString() ?? "Never"}
            </span>
          </div>
        </div>

        <button
          onClick={refresh}
          disabled={isLoading}
          aria-label="Refresh data"
          title="Refresh data"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 transition-all hover:border-indigo-200 hover:bg-indigo-100 hover:text-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw
            size={16}
            strokeWidth={1.9}
            className={isLoading ? "animate-spin" : ""}
          />
        </button>
      </div>
    </header>
  );
}
