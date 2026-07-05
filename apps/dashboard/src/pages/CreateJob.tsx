import { useState } from "react";
import api from "../api/client.js";

type JobType = "ONCE" | "DELAYED" | "CRON";

const initialForm = {
  name: "",
  description: "",
  type: "ONCE" as JobType,
  payload: "{\n\n}",
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const body = {
        ...form,
        payload: JSON.parse(form.payload),
        nextRunAt: form.nextRunAt || undefined,
        cronExpression: form.cronExpression || undefined,
      };

      await api.post("/jobs/create", body);

      alert("Job created successfully.");

      handleReset();
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert("Payload must be valid JSON.");
      } else {
        alert("Failed to create job.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure a one-time, delayed, or recurring job.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          {/* Basic Information */}

          <section className="space-y-5">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div>
              <label className="mb-2 block text-sm font-medium">Job Name</label>

              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                rows={3}
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Job Type</label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
              >
                <option value="ONCE">One Time</option>
                <option value="DELAYED">Delayed</option>
                <option value="CRON">Cron</option>
              </select>
            </div>
          </section>

          {/* Schedule */}

          {(form.type === "CRON" || form.type === "DELAYED") && (
            <section className="space-y-5">
              <h2 className="text-lg font-semibold">Schedule</h2>

              {form.type === "CRON" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Cron Expression
                  </label>

                  <input
                    name="cronExpression"
                    value={form.cronExpression}
                    onChange={handleChange}
                    placeholder="0 */5 * * * *"
                    className="w-full rounded-lg border px-4 py-3"
                  />
                </div>
              )}

              {form.type === "DELAYED" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Execute At
                  </label>

                  <input
                    type="datetime-local"
                    name="nextRunAt"
                    value={form.nextRunAt}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-4 py-3"
                  />
                </div>
              )}
            </section>
          )}

          {/* Payload */}

          <section>
            <h2 className="mb-4 text-lg font-semibold">Payload</h2>

            <textarea
              rows={10}
              name="payload"
              value={form.payload}
              onChange={handleChange}
              spellCheck={false}
              className="w-full rounded-lg border bg-gray-50 p-4 font-mono text-sm"
            />
          </section>

          {/* Configuration */}

          <section>
            <h2 className="mb-4 text-lg font-semibold">Execution Settings</h2>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Priority
                </label>

                <input
                  type="number"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Max Retries
                </label>

                <input
                  type="number"
                  name="maxRetries"
                  value={form.maxRetries}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Timeout (ms)
                </label>

                <input
                  type="number"
                  name="timeoutMs"
                  value={form.timeoutMs}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>
            </div>

            <label className="mt-5 flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />
              Active
            </label>
          </section>

          <div className="flex justify-end gap-3 border-t pt-6">
            <button
              type="reset"
              onClick={handleReset}
              className="rounded-lg border px-6 py-2.5 font-medium hover:bg-gray-100"
            >
              Reset
            </button>

            <button
              disabled={loading}
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
