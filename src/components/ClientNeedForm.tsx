"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ClientNeedForm() {
  const router = useRouter();
  const [needText, setNeedText] = useState("");
  const [sector, setSector] = useState("");
  const [application, setApplication] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!needText.trim()) {
      setError("Please describe the client's need.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/client-needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          needText: needText.trim(),
          sector: sector.trim() || null,
          application: application.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/intake");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">
          What does the client need?
        </label>
        <textarea
          value={needText}
          onChange={(e) => setNeedText(e.target.value)}
          required
          rows={10}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder="Capture the need in the client's own words — as much detail as they gave you."
        />
        <p className="mt-1 text-xs text-slate-500">
          Free text. Paste or write out what the client said — don&apos;t
          worry about structuring it.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Sector
          </label>
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="Aviation, Construction, Energy..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Application
          </label>
          <input
            type="text"
            value={application}
            onChange={(e) => setApplication(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="Airport perimeter lighting, tower crane fleet..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Submit Client Need"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/intake")}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
