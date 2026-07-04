import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Cpu,
  BarChart,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";

export default function Sidebar() {
  const [jobsOpen, setJobsOpen] = useState(false);

  return (
    <nav className="flex h-full flex-col p-4 space-y-1">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center gap-2 rounded p-2 transition ${
            isActive ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
          }`
        }
      >
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>

      {/* Jobs */}
      <button
        onClick={() => setJobsOpen(!jobsOpen)}
        className="flex w-full items-center justify-between rounded p-2 hover:bg-gray-100"
      >
        <div className="flex items-center gap-2">
          <ListChecks size={18} />
          Jobs
        </div>

        {jobsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {jobsOpen && (
        <div className="ml-7 flex flex-col space-y-1">
          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `rounded p-2 text-sm ${
                isActive ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
              }`
            }
          >
            All Jobs
          </NavLink>

          <NavLink
            to="/jobs/create"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded p-2 text-sm ${
                isActive ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
              }`
            }
          >
            <Plus size={14} />
            Create Job
          </NavLink>
        </div>
      )}

      <NavLink
        to="/workers"
        className={({ isActive }) =>
          `flex items-center gap-2 rounded p-2 ${
            isActive ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
          }`
        }
      >
        <Cpu size={18} />
        Workers
      </NavLink>

      <NavLink
        to="/failed"
        className={({ isActive }) =>
          `flex items-center gap-2 rounded p-2 ${
            isActive ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
          }`
        }
      >
        <Cpu size={18} />
        Failed Jobs
      </NavLink>

      <a
        href="http://localhost:3001/d/adf2lsw/distributed-job-scheduler?orgId=1&from=now-24h&to=now"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded p-2 hover:bg-gray-100"
      >
        <BarChart size={18} />
        Metrics
      </a>
    </nav>
  );
}
