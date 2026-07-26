"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewToggleButton({
  recommendationId,
  reviewed,
}: {
  recommendationId: string;
  reviewed: boolean;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setUpdating(true);
    setError(null);
    try {
      const response = await fetch(`/api/recommendations/${recommendationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: !reviewed }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Failed to update recommendation.");
        setUpdating(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleToggle}
        disabled={updating}
        className={
          reviewed
            ? "rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            : "rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {updating ? "Updating…" : reviewed ? "Reviewed ✓ (undo)" : "Mark as Reviewed"}
      </button>
    </div>
  );
}
