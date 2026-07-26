import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        PMG Trading EG — Internal
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
        PMG Solution Engine
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        Phase 1 scaffold is running. Pilot product line:{" "}
        <span className="font-medium text-slate-900">REDDOT</span> (aviation
        obstruction lighting).
      </p>
      <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
        App booted successfully against PostgreSQL via Prisma.
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
        >
          Browse Catalog →
        </Link>
        <Link
          href="/intake"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Client Needs →
        </Link>
      </div>
    </main>
  );
}
