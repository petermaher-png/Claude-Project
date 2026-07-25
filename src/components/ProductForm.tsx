"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ProductLineStatus } from "@prisma/client";
import { ProductLineBadge } from "@/components/ProductLineBadge";

type ProductLineOption = {
  id: string;
  name: string;
  slug: string;
  status: ProductLineStatus;
};

export type ProductFormInitialValues = {
  productLineId: string;
  productLineName: string;
  productLineStatus: ProductLineStatus;
  name: string;
  sku: string;
  specs: unknown;
  certificationNotes: string | null;
  certifications: unknown;
};

function jsonToText(value: unknown): string {
  if (value === undefined || value === null) return "";
  return JSON.stringify(value, null, 2);
}

export function ProductForm({
  mode,
  productId,
  productLines,
  initialValues,
}: {
  mode: "create" | "edit";
  productId?: string;
  productLines: ProductLineOption[];
  initialValues?: ProductFormInitialValues;
}) {
  const router = useRouter();
  const [productLineId, setProductLineId] = useState(
    initialValues?.productLineId ?? productLines[0]?.id ?? "",
  );
  const [name, setName] = useState(initialValues?.name ?? "");
  const [sku, setSku] = useState(initialValues?.sku ?? "");
  const [specsText, setSpecsText] = useState(
    jsonToText(initialValues?.specs) || "{\n  \n}",
  );
  const [certificationNotes, setCertificationNotes] = useState(
    initialValues?.certificationNotes ?? "",
  );
  const [certificationsText, setCertificationsText] = useState(
    jsonToText(initialValues?.certifications),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === "create" && !productLineId) {
      setError("Product line is required.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!sku.trim()) {
      setError("SKU is required.");
      return;
    }

    let specs: unknown;
    try {
      specs = JSON.parse(specsText);
    } catch {
      setError("Specs must be valid JSON.");
      return;
    }

    let certifications: unknown = undefined;
    if (certificationsText.trim() !== "") {
      try {
        certifications = JSON.parse(certificationsText);
      } catch {
        setError("Certifications must be valid JSON.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/products" : `/api/products/${productId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const body =
        mode === "create"
          ? {
              productLineId,
              name: name.trim(),
              sku: sku.trim(),
              specs,
              certificationNotes: certificationNotes.trim() || null,
              certifications,
            }
          : {
              name: name.trim(),
              sku: sku.trim(),
              specs,
              certificationNotes: certificationNotes.trim() || null,
              certifications,
            };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/catalog");
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
          Product Line
        </label>
        {mode === "create" ? (
          <select
            value={productLineId}
            onChange={(e) => setProductLineId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            {productLines.length === 0 && (
              <option value="">No product lines available</option>
            )}
            {productLines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name} ({line.status})
              </option>
            ))}
          </select>
        ) : (
          initialValues && (
            <div className="mt-2">
              <ProductLineBadge
                name={initialValues.productLineName}
                status={initialValues.productLineStatus}
              />
              <p className="mt-1 text-xs text-slate-500">
                Product line cannot be changed after creation.
              </p>
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="e.g. Medium Intensity Obstruction Light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            SKU
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="e.g. RD-OL-120"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Specs (JSON)
        </label>
        <textarea
          value={specsText}
          onChange={(e) => setSpecsText(e.target.value)}
          required
          rows={6}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder='{\n  "voltage": "120 VAC"\n}'
        />
        <p className="mt-1 text-xs text-slate-500">
          Specs vary by category — enter as a JSON object of key/value pairs.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Certification Notes
        </label>
        <textarea
          value={certificationNotes}
          onChange={(e) => setCertificationNotes(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder="Free-text compliance notes"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Certifications (JSON, optional)
        </label>
        <textarea
          value={certificationsText}
          onChange={(e) => setCertificationsText(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder='{\n  "faa": "AC 150/5345-43L"\n}'
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/catalog")}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
