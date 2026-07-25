import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";
import { DeleteProductButton } from "@/components/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      productLine: {
        select: { id: true, name: true, slug: true, status: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/catalog" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to catalog
      </Link>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-slate-500">
        Catalog
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Edit Product
      </h1>
      <p className="mt-2 text-slate-600">{product.name}</p>

      <ProductForm
        mode="edit"
        productId={product.id}
        productLines={[]}
        initialValues={{
          productLineId: product.productLine.id,
          productLineName: product.productLine.name,
          productLineStatus: product.productLine.status,
          name: product.name,
          sku: product.sku,
          specs: product.specs,
          certificationNotes: product.certificationNotes,
          certifications: product.certifications,
        }}
      />

      <DeleteProductButton productId={product.id} productName={product.name} />
    </main>
  );
}
