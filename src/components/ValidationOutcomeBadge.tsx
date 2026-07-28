import type { ValidationOutcome } from "@prisma/client";

const STYLES: Record<ValidationOutcome, string> = {
  PENDING: "border-slate-200 bg-slate-100 text-slate-600",
  ACCURATE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PARTIALLY_ACCURATE: "border-amber-200 bg-amber-50 text-amber-700",
  INACCURATE: "border-red-200 bg-red-50 text-red-700",
};

const LABELS: Record<ValidationOutcome, string> = {
  PENDING: "Validation Pending",
  ACCURATE: "Accurate",
  PARTIALLY_ACCURATE: "Partially Accurate",
  INACCURATE: "Inaccurate",
};

export function ValidationOutcomeBadge({
  outcome,
}: {
  outcome: ValidationOutcome;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[outcome]}`}
    >
      {LABELS[outcome]}
    </span>
  );
}
