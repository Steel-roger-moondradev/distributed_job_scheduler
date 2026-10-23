import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Activity, Clock3, Wifi, WifiOff, Server, RefreshCw, } from "lucide-react";
import api from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
function formatHeartbeat(heartbeat) {
    if (!heartbeat)
        return "No heartbeat";
    const timestamp = Number(heartbeat);
    if (Number.isNaN(timestamp)) {
        return new Date(heartbeat).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
}
export function Workers() {
    const [activeWorkers, setActiveWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const { data } = await api.get("/api/worker");
                setActiveWorkers(data);
            }
            catch {
                setActiveWorkers([]);
            }
            finally {
                setLoading(false);
            }
        };
        void fetchWorkers();
        const interval = setInterval(() => {
            void fetchWorkers();
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    if (loading) {
        return _jsx(LoadingSpinner, {});
    }
    if (activeWorkers.length === 0) {
        return (_jsxs("section", { className: "rounded-2xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: [_jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500", children: _jsx(Server, { size: 23, strokeWidth: 1.8 }) }), _jsx("p", { className: "mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500", children: "Worker Infrastructure" }), _jsx("h3", { className: "mt-2 text-base font-semibold tracking-tight text-slate-800", children: "No workers available" }), _jsx("p", { className: "mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500", children: "No worker nodes are currently connected to the scheduler." })] }));
    }
    const connectedWorkers = activeWorkers.filter((worker) => worker.status === "connected").length;
    const disconnectedWorkers = activeWorkers.length - connectedWorkers;
    return (_jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]", children: [_jsx("div", { className: "border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-teal-50/30 px-6 py-5 sm:px-7", children: _jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600", children: _jsx(Activity, { size: 18 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500", children: "Infrastructure" }), _jsx("h2", { className: "mt-1 text-lg font-semibold tracking-tight text-slate-900", children: "Workers" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Worker nodes connected to the scheduler." })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-teal-500" }), connectedWorkers, " Online"] }), disconnectedWorkers > 0 && (_jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-amber-500" }), disconnectedWorkers, " Offline"] }))] })] }) }), _jsx("div", { className: "grid gap-4 p-6 md:grid-cols-2", children: activeWorkers.map((worker) => {
                    const connected = worker.status === "connected";
                    return (_jsxs("div", { className: `rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${connected
                            ? "border-teal-100 bg-teal-50/20 hover:border-teal-200 hover:shadow-[0_8px_24px_rgba(13,148,136,0.08)]"
                            : "border-amber-100 bg-amber-50/20 hover:border-amber-200 hover:shadow-[0_8px_24px_rgba(214,168,79,0.08)]"}`, children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsx("div", { className: "min-w-0", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${connected
                                                        ? "bg-teal-50 text-teal-600"
                                                        : "bg-amber-50 text-amber-600"}`, children: connected ? _jsx(Wifi, { size: 16 }) : _jsx(WifiOff, { size: 16 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("h3", { className: "truncate text-sm font-semibold text-slate-800", children: worker.workerId }), _jsx("p", { className: "mt-0.5 font-mono text-[11px] text-slate-400", children: "Worker node" })] })] }) }), _jsxs("span", { className: `inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${connected
                                            ? "bg-teal-50 text-teal-700"
                                            : "bg-amber-50 text-amber-700"}`, children: [_jsx("span", { className: `h-1.5 w-1.5 rounded-full ${connected ? "bg-teal-500" : "bg-amber-500"}` }), connected ? "Online" : "Offline"] })] }), _jsx("div", { className: "mt-5 border-t border-slate-200/70 pt-4", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400", children: [_jsx(Clock3, { size: 13 }), "Last Heartbeat"] }), _jsx("span", { className: "text-right text-xs font-medium text-slate-600", children: formatHeartbeat(worker.heartbeat) })] }) })] }, worker.workerId));
                }) }), _jsxs("div", { className: "flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-6 py-3.5 sm:px-7", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-400", children: [_jsx(RefreshCw, { size: 12 }), "Automatically refreshed every 5 seconds"] }), _jsx("span", { className: "hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-300 sm:block", children: "Live" })] })] }));
}
