import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        productLine: {
          select: { id: true, name: true, slug: true, status: true },
        },
        productSuppliers: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: [{ productLine: { name: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch products." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productLineId, name, sku, specs, certificationNotes, certifications } =
      body ?? {};

    if (
      typeof productLineId !== "string" ||
      productLineId.trim() === "" ||
      typeof name !== "string" ||
      name.trim() === "" ||
      typeof sku !== "string" ||
      sku.trim() === "" ||
      specs === undefined ||
      specs === null
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid input: productLineId, name, sku, and specs are required.",
        },
        { status: 400 },
      );
    }

    const productLine = await prisma.productLine.findUnique({
      where: { id: productLineId },
    });
    if (!productLine) {
      return NextResponse.json(
        { message: `Product line ${productLineId} does not exist.` },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        productLineId,
        name: name.trim(),
        sku: sku.trim(),
        specs,
        certificationNotes: certificationNotes ?? null,
        certifications: certifications ?? undefined,
      },
      include: {
        productLine: {
          select: { id: true, name: true, slug: true, status: true },
        },
        productSuppliers: { include: { supplier: true } },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/products failed:", error);
    if (
      error instanceof Object &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A product with that SKU already exists." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Failed to create product." },
      { status: 500 },
    );
  }
}
