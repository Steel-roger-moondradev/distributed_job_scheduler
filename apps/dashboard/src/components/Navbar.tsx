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
        className="text-xl font-semibold cursor-pointer"
        onClick={() => navigate("/")}
      >
        Distributed Job Scheduler
      </h1>
      <button
        onClick={refresh}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="Refresh all data"
      >
        <RotateCcw size={20} />
      </button>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-1 py-2 text-sm">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>

        <div className="flex flex-col leading-tight">
          <span className="text-xs text-slate-500">Last Updated</span>
          <span className="font-medium">
            {lastUpdated?.toLocaleTimeString() ?? "Never"}
          </span>
        </div>
      </div>
    </header>
  );
}
