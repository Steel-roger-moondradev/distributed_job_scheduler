import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { AlertCircle, Check, RotateCcw, Zap, Globe, Mail, Clock3, } from "lucide-react";
import api from "../api/client.js";
const initialForm = {
    name: "",
    description: "",
    type: "ONCE",
    jobtype: "HTTP_REQUEST",
    url: "",
    method: "GET",
    headers: "{}",
    body: "",
    to: "",
    subject: "",
    html: "",
    cronExpression: "",
    delaySeconds: "",
    priority: 0,
    maxRetries: 3,
    timeoutMs: 30000,
    status: "ACTIVE",
};
export default function CreateJob() {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    function handleChange(e) {
        const target = e.target;
        const { name, value, type, checked } = target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? checked
                : type === "number"
                    ? Number(value)
                    : value,
        }));
    }
    function handleReset() {
        setForm(initialForm);
    }
    function buildPayload() {
        if (form.jobtype === "HTTP_REQUEST") {
            if (!form.url.trim()) {
                throw new Error("HTTP URL is required.");
            }
            let headers = {};
            try {
                headers = JSON.parse(form.headers || "{}");
            }
            catch {
                throw new Error("HTTP headers must be valid JSON.");
            }
            let body = undefined;
            if (form.body.trim()) {
                try {
                    body = JSON.parse(form.body);
                }
                catch {
                    throw new Error("HTTP body must be valid JSON.");
                }
            }
            return {
                url: form.url.trim(),
                method: form.method,
                headers,
                ...(body !== undefined && { body }),
            };
        }
        if (form.jobtype === "EMAIL") {
            if (!form.to.trim()) {
                throw new Error("Recipient email is required.");
            }
            if (!form.subject.trim()) {
                throw new Error("Email subject is required.");
            }
            if (!form.html.trim()) {
                throw new Error("Email HTML content is required.");
            }
            return {
                to: form.to
                    .split(",")
                    .map((email) => email.trim())
                    .filter(Boolean),
                subject: form.subject.trim(),
                html: form.html,
            };
        }
        throw new Error("Invalid job type.");
    }
    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = buildPayload();
            console.log("FORM STATUS:", form.status);
            const body = {
                name: form.name.trim(),
                description: form.description.trim() || undefined,
                type: form.type,
                jobtype: form.jobtype,
                payload,
                cronExpression: form.type === "CRON" ? form.cronExpression.trim() : undefined,
                delaySeconds: form.type === "DELAYED" && form.delaySeconds
                    ? Math.max(0, Math.floor((new Date(form.delaySeconds).getTime() - Date.now()) / 1000))
                    : undefined,
                priority: form.priority,
                maxRetries: form.maxRetries,
                timeoutMs: form.timeoutMs,
                status: form.status,
            };
            console.log("REQUEST BODY:", body);
            await api.post("/jobs/create", body);
            alert("Job created successfully.");
            handleReset();
        }
        catch (err) {
            if (err instanceof Error) {
                alert(err.message);
            }
            else {
                alert("Failed to create job.");
            }
        }
        finally {
            setLoading(false);
        }
    }
    const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50";
    const selectClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50";
    const codeClass = "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 font-mono text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50";
    return (_jsx("div", { className: "mx-auto max-w-5xl pb-10", children: _jsxs("div", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]", children: [_jsx("div", { className: "border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/40 px-5 py-6 sm:px-8", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600", children: _jsx(Zap, { size: 20 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500", children: "Job Configuration" }), _jsx("h1", { className: "mt-1 text-xl font-semibold tracking-tight text-slate-900", children: "Create New Job" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Configure when and how your job should execute." })] })] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "divide-y divide-slate-100", children: [_jsxs("section", { className: "px-5 py-8 sm:px-8", children: [_jsx(SectionHeader, { icon: _jsx(Zap, { size: 16 }), eyebrow: "Configuration", title: "Basic Information", description: "Give your job a name and choose its execution schedule.", accent: "indigo" }), _jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Job Name" }), _jsx("input", { name: "name", required: true, value: form.name, onChange: handleChange, placeholder: "e.g. Send daily report", className: inputClass })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Description" }), _jsx("textarea", { rows: 3, name: "description", value: form.description, onChange: handleChange, placeholder: "Describe what this job does...", className: `${inputClass} resize-none` })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Schedule Type" }), _jsxs("select", { name: "type", value: form.type, onChange: handleChange, className: selectClass, children: [_jsx("option", { value: "ONCE", children: "One Time" }), _jsx("option", { value: "DELAYED", children: "Delayed" }), _jsx("option", { value: "CRON", children: "Recurring (Cron)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Job Action" }), _jsxs("select", { name: "jobtype", value: form.jobtype, onChange: handleChange, className: selectClass, children: [_jsx("option", { value: "HTTP_REQUEST", children: "HTTP Request" }), _jsx("option", { value: "EMAIL", children: "Send Email" })] })] })] })] }), (form.type === "CRON" || form.type === "DELAYED") && (_jsxs("section", { className: "bg-violet-50/20 px-5 py-8 sm:px-8", children: [_jsx(SectionHeader, { icon: _jsx(Clock3, { size: 16 }), eyebrow: "Timing", title: "Schedule", description: "Configure when the worker should execute this job.", accent: "violet" }), form.type === "CRON" && (_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Cron Expression" }), _jsx("input", { name: "cronExpression", required: true, value: form.cronExpression, onChange: handleChange, placeholder: "0 */5 * * * *", className: codeClass }), _jsxs("p", { className: "mt-2 text-xs text-slate-400", children: ["Example:", " ", _jsx("code", { className: "rounded-md bg-violet-50 px-1.5 py-0.5 font-mono text-violet-600", children: "0 */5 * * * *" }), " ", "runs every 5 minutes."] })] })), form.type === "DELAYED" && (_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Execute At" }), _jsx("input", { type: "datetime-local", name: "delaySeconds", required: true, value: form.delaySeconds, onChange: handleChange })] }))] })), form.jobtype === "HTTP_REQUEST" && (_jsxs("section", { className: "px-5 py-8 sm:px-8", children: [_jsx(SectionHeader, { icon: _jsx(Globe, { size: 16 }), eyebrow: "Action", title: "HTTP Request", description: "Configure the HTTP request your worker will execute.", accent: "indigo" }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "grid gap-5 md:grid-cols-[1fr_160px]", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "URL" }), _jsx("input", { name: "url", required: true, value: form.url, onChange: handleChange, placeholder: "https://api.example.com/users", className: codeClass })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Method" }), _jsxs("select", { name: "method", value: form.method, onChange: handleChange, className: selectClass, children: [_jsx("option", { value: "GET", children: "GET" }), _jsx("option", { value: "POST", children: "POST" }), _jsx("option", { value: "PUT", children: "PUT" }), _jsx("option", { value: "PATCH", children: "PATCH" }), _jsx("option", { value: "DELETE", children: "DELETE" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Headers" }), _jsx("textarea", { rows: 5, name: "headers", value: form.headers, onChange: handleChange, spellCheck: false, className: codeClass }), _jsx("p", { className: "mt-2 text-xs text-slate-400", children: "JSON object containing request headers." })] }), ["POST", "PUT", "PATCH"].includes(form.method) && (_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Request Body" }), _jsx("textarea", { rows: 7, name: "body", value: form.body, onChange: handleChange, spellCheck: false, placeholder: '{\n  "message": "Hello"\n}', className: codeClass })] }))] })] })), form.jobtype === "EMAIL" && (_jsxs("section", { className: "bg-violet-50/15 px-5 py-8 sm:px-8", children: [_jsx(SectionHeader, { icon: _jsx(Mail, { size: 16 }), eyebrow: "Action", title: "Email", description: "Configure the email that your worker will send.", accent: "violet" }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Recipient" }), _jsx("input", { name: "to", required: true, value: form.to, onChange: handleChange, placeholder: "user@example.com", className: inputClass }), _jsx("p", { className: "mt-2 text-xs text-slate-400", children: "Separate multiple email addresses with commas." })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Subject" }), _jsx("input", { name: "subject", required: true, value: form.subject, onChange: handleChange, placeholder: "Scheduled job notification", className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "HTML Content" }), _jsx("textarea", { rows: 10, name: "html", required: true, value: form.html, onChange: handleChange, spellCheck: false, placeholder: "<h1>Hello!</h1><p>Your scheduled job has completed.</p>", className: codeClass })] })] })] })), _jsxs("section", { className: "px-5 py-8 sm:px-8", children: [_jsx(SectionHeader, { icon: _jsx(AlertCircle, { size: 16 }), eyebrow: "Runtime", title: "Execution Settings", description: "Control priority, retries, timeout, and job activation.", accent: "amber" }), _jsxs("div", { className: "grid gap-5 md:grid-cols-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Priority" }), _jsx("input", { type: "number", name: "priority", min: 0, value: form.priority, onChange: handleChange, className: inputClass }), _jsx("p", { className: "mt-1.5 text-xs text-slate-400", children: "Higher priority jobs can be processed first." })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Max Retries" }), _jsx("input", { type: "number", name: "maxRetries", min: 0, value: form.maxRetries, onChange: handleChange, className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-slate-700", children: "Timeout (ms)" }), _jsx("input", { type: "number", name: "timeoutMs", min: 1000, value: form.timeoutMs, onChange: handleChange, className: inputClass })] })] }), _jsxs("label", { className: "mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3.5 transition-colors hover:bg-teal-50", children: [_jsx("input", { type: "checkbox", checked: form.status === "ACTIVE", onChange: (e) => setForm((prev) => ({
                                                ...prev,
                                                status: e.target.checked ? "ACTIVE" : "PAUSED",
                                            })), className: "h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-200" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-teal-800", children: "Activate job immediately" }), _jsx("p", { className: "mt-0.5 text-xs text-teal-600/70", children: "The scheduler can begin processing this job after creation." })] })] })] }), _jsxs("div", { className: "flex flex-col-reverse gap-2 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-8", children: [_jsxs("button", { type: "button", onClick: handleReset, disabled: loading, className: "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50", children: [_jsx(RotateCcw, { size: 15, strokeWidth: 1.8 }), "Reset"] }), _jsx("button", { disabled: loading, type: "submit", className: "inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50", children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" }), "Creating..."] })) : (_jsxs(_Fragment, { children: [_jsx(Check, { size: 15, strokeWidth: 2 }), "Create Job"] })) })] })] })] }) }));
}
function SectionHeader({ icon, eyebrow, title, description, accent, }) {
    const styles = {
        indigo: {
            icon: "bg-indigo-50 text-indigo-600",
            eyebrow: "text-indigo-500",
        },
        violet: {
            icon: "bg-violet-50 text-violet-600",
            eyebrow: "text-violet-500",
        },
        amber: {
            icon: "bg-amber-50 text-amber-600",
            eyebrow: "text-amber-600",
        },
    };
    return (_jsxs("div", { className: "mb-6 flex items-start gap-3", children: [_jsx("div", { className: `mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles[accent].icon}`, children: icon }), _jsxs("div", { children: [_jsx("p", { className: `text-[10px] font-semibold uppercase tracking-[0.18em] ${styles[accent].eyebrow}`, children: eyebrow }), _jsx("h2", { className: "mt-1 text-base font-semibold tracking-tight text-slate-900", children: title }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: description })] })] }));
}
