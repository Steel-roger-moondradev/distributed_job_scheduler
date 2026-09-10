import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/70 shadow-[0_8px_30px_rgba(99,102,241,0.08)]">
          <Compass size={28} strokeWidth={1.7} className="text-indigo-500" />

          <span className="absolute -right-2 -top-2 rounded-lg border border-violet-100 bg-violet-50 px-2 py-1 text-[10px] font-bold tracking-wide text-violet-600">
            404
          </span>
        </div>

        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">
          Page unavailable
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Page not found
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          The page you're looking for doesn't exist or may have been moved to
          another location.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>

        <div className="mx-auto mt-10 h-px w-16 bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />

        <p className="mt-4 text-xs text-slate-400">Distributed Job Scheduler</p>
      </div>
    </div>
  );
}
