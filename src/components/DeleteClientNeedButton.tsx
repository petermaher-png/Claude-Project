"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteClientNeedButton({
  clientNeedId,
}: {
  clientNeedId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this client need? This also removes any recommendations generated from it. This cannot be undone.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/client-needs/${clientNeedId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Failed to delete client need.");
        setDeleting(false);
        return;
      }
      router.push("/intake");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {deleting ? "Deleting..." : "Delete Client Need"}
      </button>
    </div>
  );
}
