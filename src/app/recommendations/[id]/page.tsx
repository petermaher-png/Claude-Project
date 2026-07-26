import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ReviewToggleButton } from "@/components/ReviewToggleButton";
import { RecommendationStatusBadge } from "@/components/RecommendationStatusBadge";

export const dynamic = "force-dynamic";

interface ProposalItem {
  productId?: string;
  name?: string;
  sku?: string;
  quantity?: string;
  notes?: string;
  supplierName?: string;
  estimatedPricing?: string;
  leadTimeDays?: number;
  paymentTerms?: string;
}

interface StructuredProposal {
  equipment?: ProposalItem[];
  material?: ProposalItem[];
  sourcing?: ProposalItem[];
}

function isProposalItemArray(value: unknown): value is ProposalItem[] {
  return Array.isArray(value);
}

function isStructuredProposal(value: unknown): value is StructuredProposal {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const hasEquipment = "equipment" in record && isProposalItemArray(record.equipment);
  const hasMaterial = "material" in record && isProposalItemArray(record.material);
  const hasSourcing = "sourcing" in record && isProposalItemArray(record.sourcing);
  return hasEquipment || hasMaterial || hasSourcing;
}

function ItemList({ title, items }: { title: string; items?: ProposalItem[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-700">{title}</h3>
      {!items || items.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">None recommended.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            >
              <p className="font-medium text-slate-900">
                {item.name ?? item.supplierName ?? "Item"}
                {item.sku && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    SKU {item.sku}
                  </span>
                )}
              </p>
              <dl className="mt-1 grid grid-cols-1 gap-x-4 gap-y-0.5 text-xs text-slate-600 sm:grid-cols-2">
                {item.quantity && (
                  <div>
                    <dt className="inline font-medium">Qty: </dt>
                    <dd className="inline">{item.quantity}</dd>
                  </div>
                )}
                {item.supplierName && (
                  <div>
                    <dt className="inline font-medium">Supplier: </dt>
                    <dd className="inline">{item.supplierName}</dd>
                  </div>
                )}
                {item.estimatedPricing && (
                  <div>
                    <dt className="inline font-medium">Pricing: </dt>
                    <dd className="inline">{item.estimatedPricing}</dd>
                  </div>
                )}
                {item.leadTimeDays !== undefined && (
                  <div>
                    <dt className="inline font-medium">Lead time: </dt>
                    <dd className="inline">{item.leadTimeDays} days</dd>
                  </div>
                )}
                {item.paymentTerms && (
                  <div>
                    <dt className="inline font-medium">Terms: </dt>
                    <dd className="inline">{item.paymentTerms}</dd>
                  </div>
                )}
                {item.notes && (
                  <div className="sm:col-span-2">
                    <dt className="inline font-medium">Notes: </dt>
                    <dd className="inline">{item.notes}</dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function RecommendationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const recommendation = await prisma.recommendation.findUnique({
    where: { id: params.id },
    include: { clientNeed: true },
  });

  if (!recommendation) {
    notFound();
  }

  const structuredProposal = isStructuredProposal(recommendation.proposal)
    ? recommendation.proposal
    : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href={`/intake/${recommendation.clientNeedId}`}
        className="text-sm text-slate-500 hover:text-slate-800"
      >
        ← Back to client need
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Recommendation
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Proposed Solution
          </h1>
        </div>
        <RecommendationStatusBadge reviewed={recommendation.reviewed} />
      </div>
      <p className="mt-2 text-slate-600">
        Generated {recommendation.createdAt.toLocaleDateString()} at{" "}
        {recommendation.createdAt.toLocaleTimeString()}
      </p>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Client Need Context
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
          {recommendation.clientNeed.needText}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-6 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-slate-700">Sector</h3>
            <p className="mt-1 text-sm text-slate-600">
              {recommendation.clientNeed.sector ?? "—"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-700">
              Application
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {recommendation.clientNeed.application ?? "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Proposal
        </h2>
        {structuredProposal ? (
          <div className="mt-4 space-y-6">
            <ItemList title="Equipment" items={structuredProposal.equipment} />
            <ItemList title="Material" items={structuredProposal.material} />
            <ItemList title="Sourcing" items={structuredProposal.sourcing} />
          </div>
        ) : (
          <pre className="mt-4 overflow-x-auto rounded-md bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
            {JSON.stringify(recommendation.proposal, null, 2)}
          </pre>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Reasoning
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {recommendation.reasoning}
        </p>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="mb-3 text-sm text-slate-600">
          Internal review gate — nothing reaches the client until this is
          marked reviewed.
        </p>
        <ReviewToggleButton
          recommendationId={recommendation.id}
          reviewed={recommendation.reviewed}
        />
      </div>
    </main>
  );
}
