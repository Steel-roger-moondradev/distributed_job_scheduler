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
    // Invalidate **all** queries so every page reloads its data
    queryClient.invalidateQueries({ refetchType: "all" });
  };

  useEffect(() => {
    if (isFetching === 0) {
      setLastUpdated(new Date());
    }
  }, [isFetching]);

  return (
    <header className="flex items-center justify-between bg-white px-4 py-2 shadow">
      <h1
        className="cursor-pointer text-xl font-semibold"
        onClick={() => navigate("/")}
      >
        Distributed Job Scheduler
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={refresh}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 active:scale-95"
        >
          <RotateCcw size={20} />
        </button>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>

          <div className="flex flex-col leading-tight">
            <span className="text-xs text-slate-500">Last Updated</span>
            <span className="font-medium">
              {lastUpdated?.toLocaleTimeString() ?? "Never"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
