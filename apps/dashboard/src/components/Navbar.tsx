import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
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

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-6">
      {/* Brand */}
      <button
        onClick={() => navigate("/")}
        className="text-left text-lg font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-700"
      >
        Distributed Job Scheduler
      </button>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Last updated */}
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
          <span
            className={`h-2 w-2 rounded-full ${
              isFetching > 0 ? "animate-pulse bg-amber-400" : "bg-emerald-500"
            }`}
          />

          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Last updated
            </span>

            <span className="mt-1 text-xs font-medium text-slate-700">
              {lastUpdated?.toLocaleTimeString() ?? "Never"}
            </span>
          </div>
        </div>

        {/* Refresh */}
        <button
          onClick={refresh}
          disabled={isFetching > 0}
          aria-label="Refresh data"
          title="Refresh data"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw
            size={17}
            className={isFetching > 0 ? "animate-spin" : ""}
          />
        </button>
      </div>
    </header>
  );
}
