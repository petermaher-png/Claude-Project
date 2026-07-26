import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const PREVIEW_LENGTH = 140;

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

async function getClientNeeds() {
  return prisma.clientNeed.findMany({
    include: {
      _count: {
        select: { recommendations: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function IntakePage() {
  const clientNeeds = await getClientNeeds();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Intake
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Client Needs
          </h1>
          <p className="mt-2 text-slate-600">
            {clientNeeds.length} client need
            {clientNeeds.length === 1 ? "" : "s"} captured.
          </p>
        </div>
        <Link
          href="/intake/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
        >
          + New Client Need
        </Link>
      </div>

      {clientNeeds.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-slate-600">No client needs captured yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Record what a client told you in their own words to get started.
          </p>
          <Link
            href="/intake/new"
            className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            + New Client Need
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Need
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sector
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Application
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recommendations
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientNeeds.map((clientNeed) => (
                <tr key={clientNeed.id} className="hover:bg-slate-50">
                  <td className="max-w-xs px-4 py-3 text-sm text-slate-900">
                    {truncate(clientNeed.needText, PREVIEW_LENGTH)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {clientNeed.sector ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {clientNeed.application ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {clientNeed.createdAt.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {clientNeed._count.recommendations > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        {clientNeed._count.recommendations} recommendation
                        {clientNeed._count.recommendations === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        Not yet reviewed
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <Link
                      href={`/intake/${clientNeed.id}`}
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
