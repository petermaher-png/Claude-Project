import Link from "next/link";
import { ClientNeedForm } from "@/components/ClientNeedForm";

export const dynamic = "force-dynamic";

export default function NewClientNeedPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/intake" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to client needs
      </Link>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-slate-500">
        Intake
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        New Client Need
      </h1>
      <p className="mt-2 text-slate-600">
        Capture what the client told you, in their own words.
      </p>

      <ClientNeedForm />
    </main>
  );
}
