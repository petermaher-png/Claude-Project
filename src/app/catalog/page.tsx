import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductLineBadge } from "@/components/ProductLineBadge";
import { lowestUnitPrice } from "@/lib/pricing";

export const dynamic = "force-dynamic";

async function getProducts() {
  return prisma.product.findMany({
    include: {
      productLine: {
        select: { id: true, name: true, slug: true, status: true },
      },
      productSuppliers: {
        include: { supplier: true },
      },
    },
    orderBy: [{ productLine: { name: "asc" } }, { name: "asc" }],
  });
}

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Catalog
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-2 text-slate-600">
            {products.length} product{products.length === 1 ? "" : "s"} across
            all product lines.
          </p>
        </div>
        <Link
          href="/catalog/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-slate-600">No products yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Add your first product to get started, or run{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
              npm run seed
            </code>{" "}
            to load placeholder REDDOT data.
          </p>
          <Link
            href="/catalog/new"
            className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            + Add Product
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product Line
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Suppliers
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Lowest Price
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const prices = product.productSuppliers
                  .map((ps) => lowestUnitPrice(ps.pricingBands))
                  .filter((p): p is NonNullable<typeof p> => p !== null);
                const lowest = prices.sort((a, b) => a.unitPrice - b.unitPrice)[0];

                return (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <ProductLineBadge
                        name={product.productLine.name}
                        status={product.productLine.status}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-slate-700">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {product.productSuppliers.length}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {lowest
                        ? `${lowest.unitPrice.toLocaleString()} ${lowest.currency}`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <Link
                        href={`/catalog/${product.id}`}
                        className="font-medium text-slate-600 hover:text-slate-900"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                );
              })}
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
