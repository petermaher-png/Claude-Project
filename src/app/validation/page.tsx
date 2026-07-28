import Link from "next/link";
import { prisma } from "@/lib/db";
import { RecommendationStatusBadge } from "@/components/RecommendationStatusBadge";
import { ValidationOutcomeBadge } from "@/components/ValidationOutcomeBadge";
import type { ValidationOutcome } from "@prisma/client";

export const dynamic = "force-dynamic";

const NOTES_PREVIEW_LENGTH = 160;

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

async function getRecommendations() {
  return prisma.recommendation.findMany({
    include: { clientNeed: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ValidationPage() {
  const recommendations = await getRecommendations();

  const counts = recommendations.reduce(
    (acc, rec) => {
      acc[rec.validationOutcome] += 1;
      return acc;
    },
    {
      PENDING: 0,
      ACCURATE: 0,
      PARTIALLY_ACCURATE: 0,
      INACCURATE: 0,
    } satisfies Record<ValidationOutcome, number>,
  );

  const reviewedCount = recommendations.filter((r) => r.reviewed).length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          ROADMAP Item 7
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Internal Validation
        </h1>
        <p className="mt-2 text-slate-600">
          Track what the recommendation engine got right or wrong across real
          upcoming REDDOT conversations — this is the gate for Phase 2.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {recommendations.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Reviewed
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {reviewedCount}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Accurate
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-900">
            {counts.ACCURATE}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
            Partially Accurate
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {counts.PARTIALLY_ACCURATE}
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-red-700">
            Inaccurate
          </p>
          <p className="mt-1 text-2xl font-semibold text-red-900">
            {counts.INACCURATE}
          </p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-slate-600">No recommendations generated yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Generate a recommendation from a client need to start capturing
            validation feedback.
          </p>
          <Link
            href="/intake"
            className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            Go to Client Needs
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Client Need
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Review Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Accuracy
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Validation Notes
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Generated
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recommendations.map((recommendation) => (
                <tr key={recommendation.id} className="hover:bg-slate-50">
                  <td className="max-w-xs px-4 py-3 text-sm text-slate-900">
                    {truncate(recommendation.clientNeed.needText, NOTES_PREVIEW_LENGTH)}
                    {recommendation.clientNeed.application && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {recommendation.clientNeed.application}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <RecommendationStatusBadge reviewed={recommendation.reviewed} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <ValidationOutcomeBadge outcome={recommendation.validationOutcome} />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-sm text-slate-600">
                    {recommendation.validationNotes
                      ? truncate(recommendation.validationNotes, NOTES_PREVIEW_LENGTH)
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {recommendation.createdAt.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <Link
                      href={`/recommendations/${recommendation.id}`}
                      className="font-medium text-slate-600 hover:text-slate-900"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Back home
        </Link>
      </div>
    </main>
  );
}
