import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Cpu,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Plus,
  XCircle,
} from "lucide-react";

export default function Sidebar() {
  const [jobsOpen, setJobsOpen] = useState(true);

  const navItem = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
      isActive
        ? "bg-indigo-50 font-semibold text-indigo-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const subNavItem = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
      isActive
        ? "bg-indigo-50 font-medium text-indigo-700"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    }`;

  return (
    <nav className="flex h-full flex-col bg-white px-3 py-5">
      <div className="mb-4 px-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Navigation
        </span>
      </div>

      <div className="space-y-1">
        <NavLink to="/" className={navItem}>
          <LayoutDashboard
            size={18}
            strokeWidth={1.8}
            className="transition-colors group-[.active]:text-indigo-600"
          />
          <span>Dashboard</span>
        </NavLink>

        <button
          onClick={() => setJobsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <div className="flex items-center gap-3">
            <ListChecks size={18} strokeWidth={1.8} />
            <span>Jobs</span>
          </div>

          <span className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition-colors">
            {jobsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </span>
        </button>

        {jobsOpen && (
          <div className="ml-5 space-y-1 border-l border-indigo-100 pl-2">
            <NavLink to="/jobs" className={subNavItem}>
              <span>All Jobs</span>
            </NavLink>

            <NavLink to="/jobs/create" className={subNavItem}>
              <Plus size={14} strokeWidth={2} />
              <span>Create Job</span>
            </NavLink>
          </div>
        )}

        <NavLink to="/workers" className={navItem}>
          <Cpu size={18} strokeWidth={1.8} />
          <span>Workers</span>
        </NavLink>

        <NavLink to="/failed" className={navItem}>
          <XCircle size={18} strokeWidth={1.8} />
          <span>Failed Jobs</span>
        </NavLink>

        <NavLink to="/metrics" className={navItem}>
          <BarChart3 size={18} strokeWidth={1.8} />
          <span>Metrics</span>
        </NavLink>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-teal-50/60 px-3 py-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
          </span>

          <div>
            <p className="text-xs font-medium text-teal-700">
              System operational
            </p>
            <p className="mt-0.5 text-[10px] text-teal-600/60">
              All services running
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
