import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface HealthCardProps {
  title: string;
  status: "healthy" | "warning" | "error";
  description?: string;
}

export function HealthCard({ title, status, description }: HealthCardProps) {
  const config = {
    healthy: {
      icon: CheckCircle2,
      color: "text-teal-600",
      iconBg: "bg-teal-50",
      border: "border-teal-100",
      dot: "bg-teal-500",
      label: "Healthy",
    },
    warning: {
      icon: AlertCircle,
      color: "text-amber-600",
      iconBg: "bg-amber-50",
      border: "border-amber-100",
      dot: "bg-amber-500",
      label: "Warning",
    },
    error: {
      icon: XCircle,
      color: "text-rose-600",
      iconBg: "bg-rose-50",
      border: "border-rose-100",
      dot: "bg-rose-500",
      label: "Down",
    },
  };

  const { icon: Icon, color, iconBg, border, dot, label } = config[status];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400">
            System Status
          </p>

          <h3 className="mt-1.5 truncate text-sm font-semibold text-slate-800">
            {title}
          </h3>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${border} border`}
        >
          <Icon className={`h-[19px] w-[19px] ${color}`} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2.5">
        <span
          className={`h-2 w-2 rounded-full ${dot} ${
            status === "healthy"
              ? "shadow-[0_0_0_3px_rgba(13,148,136,0.08)]"
              : ""
          }`}
        />

        <span className={`text-sm font-semibold ${color}`}>{label}</span>
      </div>

      {description && (
        <p className="mt-2.5 text-xs leading-5 text-slate-400">{description}</p>
      )}
    </div>
  );
}
