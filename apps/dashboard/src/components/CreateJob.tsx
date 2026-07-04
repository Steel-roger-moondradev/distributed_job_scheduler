import { useState } from "react";

type JobType = "ONE_TIME" | "DELAYED" | "CRON";

export default function CreateJob() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "ONE_TIME" as JobType,
    payload: "{}",
    cronExpression: "",
    nextRunAt: "",
    priority: 0,
    maxRetries: 3,
    timeoutMs: 30000,
    active: true,
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value, type, checked } = e.target as HTMLInputElement;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const body = {
        ...form,
        payload: JSON.parse(form.payload),
      };

      console.log(body);

      // await createJob(body);
    } catch {
      alert("Payload must be valid JSON.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold">Create Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block font-medium">Job Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Job Type</label>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full rounded border p-3"
          >
            <option value="ONE_TIME">One Time</option>
            <option value="DELAYED">Delayed</option>
            <option value="CRON">Cron</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">Payload (JSON)</label>

          <textarea
            rows={8}
            name="payload"
            value={form.payload}
            onChange={handleChange}
            className="font-mono w-full rounded border p-3"
          />
        </div>

        {form.type === "CRON" && (
          <div>
            <label className="mb-1 block font-medium">Cron Expression</label>

            <input
              name="cronExpression"
              value={form.cronExpression}
              onChange={handleChange}
              placeholder="0 */5 * * * *"
              className="w-full rounded border p-3"
            />
          </div>
        )}

        {form.type === "DELAYED" && (
          <div>
            <label className="mb-1 block font-medium">Execute At</label>

            <input
              type="datetime-local"
              name="nextRunAt"
              value={form.nextRunAt}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block font-medium">Priority</label>

            <input
              type="number"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Max Retries</label>

            <input
              type="number"
              name="maxRetries"
              value={form.maxRetries}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Timeout (ms)</label>

            <input
              type="number"
              name="timeoutMs"
              value={form.timeoutMs}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
          />
          Active
        </label>

        <div className="flex justify-end gap-3">
          <button type="button" className="rounded border px-5 py-2">
            Cancel
          </button>

          <button
            type="submit"
            className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Create Job
          </button>
        </div>
      </form>
    </div>
  );
}
