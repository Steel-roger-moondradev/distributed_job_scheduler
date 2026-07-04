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
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      label: "Healthy",
    },
    warning: {
      icon: AlertCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      label: "Warning",
    },
    error: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "Down",
    },
  };

  const { icon: Icon, color, bg, border, label } = config[status];

  return (
    <div
      className={`rounded-xl border ${border} ${bg} p-5 shadow-sm transition hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>

        <Icon className={`h-6 w-6 ${color}`} />
      </div>

      <div className={`mt-4 text-xl font-bold ${color}`}>{label}</div>

      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}
