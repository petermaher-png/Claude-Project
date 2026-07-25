import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const productLines = await prisma.productLine.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/catalog" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to catalog
      </Link>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-slate-500">
        Catalog
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Add Product
      </h1>
      <p className="mt-2 text-slate-600">
        Create a new product against a product line&apos;s schema.
      </p>

      {productLines.length === 0 ? (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No product lines exist yet. Seed the database (
          <code className="rounded bg-amber-100 px-1 py-0.5">npm run seed</code>
          ) before adding products.
        </div>
      ) : (
        <ProductForm mode="create" productLines={productLines} />
      )}
    </main>
  );
}
