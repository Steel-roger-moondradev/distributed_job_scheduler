import { useState } from "react";
import api from "../api/client.js";

type JobType = "ONCE" | "DELAYED" | "CRON";
type JobAction = "HTTP_REQUEST" | "EMAIL";

const initialForm = {
  name: "",
  description: "",
  type: "ONCE" as JobType,
  jobtype: "HTTP_REQUEST" as JobAction,

  // HTTP fields
  url: "",
  method: "GET",
  headers: "{}",
  body: "",

  // Email fields
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

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>

          <p className="mt-1 text-sm text-gray-500">
            Configure when and how your job should execute.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          {/* BASIC INFORMATION */}
          <section>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>

              <p className="text-sm text-gray-500">
                Give your job a name and choose its execution schedule.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Job Name
                </label>

                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Send daily report"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what this job does..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Schedule Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Schedule Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="ONCE">One Time</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="CRON">Recurring (Cron)</option>
                </select>
              </div>

              {/* Job Action */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Job Action
                </label>

                <select
                  name="jobtype"
                  value={form.jobtype}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="HTTP_REQUEST">HTTP Request</option>

                  <option value="EMAIL">Send Email</option>
                </select>
              </div>
            </div>
          </section>

          {/* SCHEDULE */}
          {(form.type === "CRON" || form.type === "DELAYED") && (
            <section className="border-t border-gray-100 pt-8">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Schedule
                </h2>

                <p className="text-sm text-gray-500">
                  Configure when the worker should execute this job.
                </p>
              </div>

              {form.type === "CRON" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Cron Expression
                  </label>

                  <input
                    name="cronExpression"
                    required
                    value={form.cronExpression}
                    onChange={handleChange}
                    placeholder="0 */5 * * * *"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Example: <code>0 */5 * * * *</code> runs every 5 minutes.
                  </p>
                </div>
              )}

              {form.type === "DELAYED" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Execute At
                  </label>

                  <input
                    type="datetime-local"
                    name="nextRunAt"
                    required
                    value={form.nextRunAt}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              )}
            </section>
          )}

          {/* HTTP CONFIGURATION */}
          {form.jobtype === "HTTP_REQUEST" && (
            <section className="border-t border-gray-100 pt-8">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  HTTP Request
                </h2>

                <p className="text-sm text-gray-500">
                  Configure the HTTP request your worker will execute.
                </p>
              </div>

              <div className="space-y-5">
                {/* URL + Method */}
                <div className="grid gap-5 md:grid-cols-[1fr_180px]">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      URL
                    </label>

                    <input
                      name="url"
                      required
                      value={form.url}
                      onChange={handleChange}
                      placeholder="https://api.example.com/users"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Method
                    </label>

                    <select
                      name="method"
                      value={form.method}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                </div>

                {/* Headers */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Headers
                  </label>

                  <textarea
                    rows={5}
                    name="headers"
                    value={form.headers}
                    onChange={handleChange}
                    spellCheck={false}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Example: {"{"}"Content-Type": "application/json"{"}"}
                  </p>
                </div>

                {/* Body */}
                {["POST", "PUT", "PATCH"].includes(form.method) && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Request Body
                    </label>

                    <textarea
                      rows={7}
                      name="body"
                      value={form.body}
                      onChange={handleChange}
                      spellCheck={false}
                      placeholder={'{\n  "message": "Hello"\n}'}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* EMAIL CONFIGURATION */}
          {form.jobtype === "EMAIL" && (
            <section className="border-t border-gray-100 pt-8">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Email</h2>

                <p className="text-sm text-gray-500">
                  Configure the email that your worker will send.
                </p>
              </div>

              <div className="space-y-5">
                {/* Recipient */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Recipient
                  </label>

                  <input
                    name="to"
                    required
                    value={form.to}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    For multiple recipients, separate email addresses with
                    commas.
                  </p>
                </div>

                {/* Subject */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Subject
                  </label>

                  <input
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Scheduled job notification"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* HTML */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>
          )}

          {/* EXECUTION SETTINGS */}
          <section className="border-t border-gray-100 pt-8">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Execution Settings
              </h2>

              <p className="text-sm text-gray-500">
                Control priority, retries, timeout, and job activation.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Priority
                </label>

                <input
                  type="number"
                  name="priority"
                  min={0}
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Higher priority jobs can be processed first.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Max Retries
                </label>

                <input
                  type="number"
                  name="maxRetries"
                  min={0}
                  value={form.maxRetries}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Timeout (ms)
                </label>

                <input
                  type="number"
                  name="timeoutMs"
                  min={1000}
                  value={form.timeoutMs}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>
            </div>

            <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 rounded"
              />
              Activate job immediately
            </label>
          </section>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>

            <button
              disabled={loading}
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
