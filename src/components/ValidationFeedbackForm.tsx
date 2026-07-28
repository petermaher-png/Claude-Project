"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ValidationOutcome } from "@prisma/client";

const OUTCOME_OPTIONS: { value: ValidationOutcome; label: string }[] = [
  { value: "PENDING", label: "Pending — not yet validated" },
  { value: "ACCURATE", label: "Accurate — matched what we'd actually propose" },
  { value: "PARTIALLY_ACCURATE", label: "Partially accurate — right direction, needed edits" },
  { value: "INACCURATE", label: "Inaccurate — missed the mark" },
];

export function ValidationFeedbackForm({
  recommendationId,
  validationOutcome,
  validationNotes,
}: {
  recommendationId: string;
  validationOutcome: ValidationOutcome;
  validationNotes: string | null;
}) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<ValidationOutcome>(validationOutcome);
  const [notes, setNotes] = useState(validationNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch(`/api/recommendations/${recommendationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validationOutcome: outcome,
          validationNotes: notes.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Failed to save validation feedback.");
        setSaving(false);
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Validation feedback saved.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Accuracy outcome
        </label>
        <select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as ValidationOutcome)}
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          {OUTCOME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Validation notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder="What did the engine get right or wrong compared to what you'd actually propose in this conversation?"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Validation Feedback"}
      </button>
    </form>
  );
}
