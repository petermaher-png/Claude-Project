"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateRecommendationButton({
  clientNeedId,
}: {
  clientNeedId: string;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientNeedId }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message ?? "Failed to generate recommendation.");
        setGenerating(false);
        return;
      }

      const recommendationId = data?.recommendation?.id;
      if (typeof recommendationId === "string") {
        router.push(`/recommendations/${recommendationId}`);
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setGenerating(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {generating ? "Generating…" : "Generate Recommendation"}
      </button>
    </div>
  );
}
