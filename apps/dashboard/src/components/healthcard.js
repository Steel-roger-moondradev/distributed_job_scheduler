import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
export function HealthCard({ title, status, description }) {
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
    return (_jsxs("div", { className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400", children: "System Status" }), _jsx("h3", { className: "mt-1.5 truncate text-sm font-semibold text-slate-800", children: title })] }), _jsx("div", { className: `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${border} border`, children: _jsx(Icon, { className: `h-[19px] w-[19px] ${color}`, strokeWidth: 1.8 }) })] }), _jsxs("div", { className: "mt-5 flex items-center gap-2.5", children: [_jsx("span", { className: `h-2 w-2 rounded-full ${dot} ${status === "healthy"
                            ? "shadow-[0_0_0_3px_rgba(13,148,136,0.08)]"
                            : ""}` }), _jsx("span", { className: `text-sm font-semibold ${color}`, children: label })] }), description && (_jsx("p", { className: "mt-2.5 text-xs leading-5 text-slate-400", children: description }))] }));
}
