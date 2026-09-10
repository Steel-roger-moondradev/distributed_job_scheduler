import { useState } from "react";
import {
  AlertCircle,
  Check,
  RotateCcw,
  Zap,
  Globe,
  Mail,
  Clock3,
} from "lucide-react";
import api from "../api/client.js";

type JobType = "ONCE" | "DELAYED" | "CRON";
type JobAction = "HTTP_REQUEST" | "EMAIL";

const initialForm = {
  name: "",
  description: "",
  type: "ONCE" as JobType,
  jobtype: "HTTP_REQUEST" as JobAction,
  url: "",
  method: "GET",
  headers: "{}",
  body: "",
  to: "",
  subject: "",
  html: "",
  cronExpression: "",
  nextRunAt: "",
  priority: 0,
  maxRetries: 3,
  timeoutMs: 30000,
  active: true,
};

export default function CreateJob() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
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
      } catch {
        throw new Error("HTTP headers must be valid JSON.");
      }

      let body: unknown = undefined;

      if (form.body.trim()) {
        try {
          body = JSON.parse(form.body);
        } catch {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = buildPayload();

      const body = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        jobtype: form.jobtype,
        payload,
        cronExpression:
          form.type === "CRON" ? form.cronExpression.trim() : undefined,
        nextRunAt:
          form.type === "DELAYED" ? form.nextRunAt || undefined : undefined,
        priority: form.priority,
        maxRetries: form.maxRetries,
        timeoutMs: form.timeoutMs,
        active: form.active,
      };

      await api.post("/jobs/create", body);

      alert("Job created successfully.");
      handleReset();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to create job.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50";

  const selectClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50";

  const codeClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 font-mono text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50";

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/40 px-5 py-6 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Zap size={20} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
                Job Configuration
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Create New Job
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Configure when and how your job should execute.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
          <section className="px-5 py-8 sm:px-8">
            <SectionHeader
              icon={<Zap size={16} />}
              eyebrow="Configuration"
              title="Basic Information"
              description="Give your job a name and choose its execution schedule."
              accent="indigo"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Job Name
                </label>

                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Send daily report"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what this job does..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Schedule Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="ONCE">One Time</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="CRON">Recurring (Cron)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Job Action
                </label>

                <select
                  name="jobtype"
                  value={form.jobtype}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="HTTP_REQUEST">HTTP Request</option>
                  <option value="EMAIL">Send Email</option>
                </select>
              </div>
            </div>
          </section>

          {(form.type === "CRON" || form.type === "DELAYED") && (
            <section className="bg-violet-50/20 px-5 py-8 sm:px-8">
              <SectionHeader
                icon={<Clock3 size={16} />}
                eyebrow="Timing"
                title="Schedule"
                description="Configure when the worker should execute this job."
                accent="violet"
              />

              {form.type === "CRON" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Cron Expression
                  </label>

                  <input
                    name="cronExpression"
                    required
                    value={form.cronExpression}
                    onChange={handleChange}
                    placeholder="0 */5 * * * *"
                    className={codeClass}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Example:{" "}
                    <code className="rounded-md bg-violet-50 px-1.5 py-0.5 font-mono text-violet-600">
                      0 */5 * * * *
                    </code>{" "}
                    runs every 5 minutes.
                  </p>
                </div>
              )}

              {form.type === "DELAYED" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Execute At
                  </label>

                  <input
                    type="datetime-local"
                    name="nextRunAt"
                    required
                    value={form.nextRunAt}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              )}
            </section>
          )}

          {form.jobtype === "HTTP_REQUEST" && (
            <section className="px-5 py-8 sm:px-8">
              <SectionHeader
                icon={<Globe size={16} />}
                eyebrow="Action"
                title="HTTP Request"
                description="Configure the HTTP request your worker will execute."
                accent="indigo"
              />

              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-[1fr_160px]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      URL
                    </label>

                    <input
                      name="url"
                      required
                      value={form.url}
                      onChange={handleChange}
                      placeholder="https://api.example.com/users"
                      className={codeClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Method
                    </label>

                    <select
                      name="method"
                      value={form.method}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Headers
                  </label>

                  <textarea
                    rows={5}
                    name="headers"
                    value={form.headers}
                    onChange={handleChange}
                    spellCheck={false}
                    className={codeClass}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    JSON object containing request headers.
                  </p>
                </div>

                {["POST", "PUT", "PATCH"].includes(form.method) && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Request Body
                    </label>

                    <textarea
                      rows={7}
                      name="body"
                      value={form.body}
                      onChange={handleChange}
                      spellCheck={false}
                      placeholder={'{\n  "message": "Hello"\n}'}
                      className={codeClass}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {form.jobtype === "EMAIL" && (
            <section className="bg-violet-50/15 px-5 py-8 sm:px-8">
              <SectionHeader
                icon={<Mail size={16} />}
                eyebrow="Action"
                title="Email"
                description="Configure the email that your worker will send."
                accent="violet"
              />

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Recipient
                  </label>

                  <input
                    name="to"
                    required
                    value={form.to}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Separate multiple email addresses with commas.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Subject
                  </label>

                  <input
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Scheduled job notification"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    HTML Content
                  </label>

                  <textarea
                    rows={10}
                    name="html"
                    required
                    value={form.html}
                    onChange={handleChange}
                    spellCheck={false}
                    placeholder="<h1>Hello!</h1><p>Your scheduled job has completed.</p>"
                    className={codeClass}
                  />
                </div>
              </div>
            </section>
          )}

          <section className="px-5 py-8 sm:px-8">
            <SectionHeader
              icon={<AlertCircle size={16} />}
              eyebrow="Runtime"
              title="Execution Settings"
              description="Control priority, retries, timeout, and job activation."
              accent="amber"
            />

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Priority
                </label>

                <input
                  type="number"
                  name="priority"
                  min={0}
                  value={form.priority}
                  onChange={handleChange}
                  className={inputClass}
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Higher priority jobs can be processed first.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Max Retries
                </label>

                <input
                  type="number"
                  name="maxRetries"
                  min={0}
                  value={form.maxRetries}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Timeout (ms)
                </label>

                <input
                  type="number"
                  name="timeoutMs"
                  min={1000}
                  value={form.timeoutMs}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3.5 transition-colors hover:bg-teal-50">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-200"
              />

              <div>
                <p className="text-sm font-medium text-teal-800">
                  Activate job immediately
                </p>

                <p className="mt-0.5 text-xs text-teal-600/70">
                  The scheduler can begin processing this job after creation.
                </p>
              </div>
            </label>
          </section>

          <div className="flex flex-col-reverse gap-2 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={15} strokeWidth={1.8} />
              Reset
            </button>

            <button
              disabled={loading}
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={15} strokeWidth={2} />
                  Create Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  accent: "indigo" | "violet" | "amber";
}) {
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

  return (
    <div className="mb-6 flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles[accent].icon}`}
      >
        {icon}
      </div>

      <div>
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${styles[accent].eyebrow}`}
        >
          {eyebrow}
        </p>

        <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
