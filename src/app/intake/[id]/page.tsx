import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DeleteClientNeedButton } from "@/components/DeleteClientNeedButton";
import { GenerateRecommendationButton } from "@/components/GenerateRecommendationButton";
import { RecommendationStatusBadge } from "@/components/RecommendationStatusBadge";

const REASONING_PREVIEW_LENGTH = 220;

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

export const dynamic = "force-dynamic";

export default async function ClientNeedDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const clientNeed = await prisma.clientNeed.findUnique({
    where: { id: params.id },
    include: {
      recommendations: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!clientNeed) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/intake" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to client needs
      </Link>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-slate-500">
        Intake
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Client Need
      </h1>
      <p className="mt-2 text-slate-600">
        Submitted {clientNeed.createdAt.toLocaleDateString()} at{" "}
        {clientNeed.createdAt.toLocaleTimeString()}
      </p>

      <div className="mt-8 space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-medium text-slate-700">
            Stated Need
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
            {clientNeed.needText}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-medium text-slate-700">Sector</h2>
            <p className="mt-1 text-sm text-slate-600">
              {clientNeed.sector ?? "—"}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-700">
              Application
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {clientNeed.application ?? "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Recommendations
          </h2>
          <GenerateRecommendationButton clientNeedId={clientNeed.id} />
        </div>
        {clientNeed.recommendations.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="text-sm text-slate-600">No recommendations yet.</p>
            <p className="mt-1 text-xs text-slate-500">
              Click &quot;Generate Recommendation&quot; to have Claude propose
              equipment, material, and sourcing for this need.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {clientNeed.recommendations.map((recommendation) => (
              <li
                key={recommendation.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <RecommendationStatusBadge reviewed={recommendation.reviewed} />
                  <span className="text-xs text-slate-500">
                    {recommendation.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {truncate(recommendation.reasoning, REASONING_PREVIEW_LENGTH)}
                </p>
                <Link
                  href={`/recommendations/${recommendation.id}`}
                  className="mt-2 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  View details →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DeleteClientNeedButton clientNeedId={clientNeed.id} />
    </main>
  );
}
