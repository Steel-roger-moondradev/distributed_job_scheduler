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
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
      isActive
        ? "bg-slate-100 font-medium text-slate-900"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const subNavItem = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
      isActive
        ? "bg-slate-100 font-medium text-slate-900"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    }`;

  return (
    <nav className="flex h-full flex-col px-3 py-5">
      {/* Navigation label */}
      <div className="mb-3 px-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Navigation
        </span>
      </div>

      <div className="space-y-1">
        {/* Dashboard */}
        <NavLink to="/" className={navItem}>
          <LayoutDashboard size={18} strokeWidth={1.8} />
          <span>Dashboard</span>
        </NavLink>

        {/* Jobs */}
        <button
          onClick={() => setJobsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <div className="flex items-center gap-3">
            <ListChecks size={18} strokeWidth={1.8} />
            <span>Jobs</span>
          </div>

          {jobsOpen ? (
            <ChevronDown size={16} className="text-slate-400" />
          ) : (
            <ChevronRight size={16} className="text-slate-400" />
          )}
        </button>

        {/* Job submenu */}
        {jobsOpen && (
          <div className="ml-5 border-l border-slate-200 pl-2">
            <NavLink to="/jobs" className={subNavItem}>
              All Jobs
            </NavLink>

            <NavLink to="/jobs/create" className={subNavItem}>
              <Plus size={14} strokeWidth={2} />
              <span>Create Job</span>
            </NavLink>
          </div>
        )}

        {/* Workers */}
        <NavLink to="/workers" className={navItem}>
          <Cpu size={18} strokeWidth={1.8} />
          <span>Workers</span>
        </NavLink>

        {/* Failed Jobs */}
        <NavLink to="/failed" className={navItem}>
          <XCircle size={18} strokeWidth={1.8} />
          <span>Failed Jobs</span>
        </NavLink>

        {/* Metrics */}
        <NavLink to="/metrics" className={navItem}>
          <BarChart3 size={18} strokeWidth={1.8} />
          <span>Metrics</span>
        </NavLink>
      </div>

      {/* Bottom status */}
      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 px-3 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          System operational
        </div>
      </div>
    </nav>
  );
}
