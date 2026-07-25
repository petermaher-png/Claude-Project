import { ProductLineStatus } from "@prisma/client";

const STATUS_STYLES: Record<ProductLineStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PLANNED: "bg-amber-50 text-amber-700 border-amber-200",
  EXPLORATION: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_LABELS: Record<ProductLineStatus, string> = {
  ACTIVE: "Active",
  PLANNED: "Planned",
  EXPLORATION: "Exploration",
};

export function ProductLineBadge({
  name,
  status,
}: {
  name: string;
  status: ProductLineStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
      title={`Line status: ${STATUS_LABELS[status]}`}
    >
      {name}
      <span className="opacity-70">· {STATUS_LABELS[status]}</span>
    </span>
  );
}
