import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        productLine: {
          select: { id: true, name: true, slug: true, status: true },
        },
        productSuppliers: { include: { supplier: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: `Product ${params.id} not found.` },
        { status: 404 },
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error(`GET /api/products/${params.id} failed:`, error);
    return NextResponse.json(
      { message: "Failed to fetch product." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { message: `Product ${params.id} not found.` },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name, sku, specs, certificationNotes, certifications } = body ?? {};

    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      return NextResponse.json(
        { message: "Invalid input: name must be a non-empty string." },
        { status: 400 },
      );
    }
    if (sku !== undefined && (typeof sku !== "string" || sku.trim() === "")) {
      return NextResponse.json(
        { message: "Invalid input: sku must be a non-empty string." },
        { status: 400 },
      );
    }
    if (specs !== undefined && specs === null) {
      return NextResponse.json(
        { message: "Invalid input: specs cannot be null." },
        { status: 400 },
      );
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(sku !== undefined ? { sku: sku.trim() } : {}),
        ...(specs !== undefined ? { specs } : {}),
        ...(certificationNotes !== undefined ? { certificationNotes } : {}),
        ...(certifications !== undefined ? { certifications } : {}),
      },
      include: {
        productLine: {
          select: { id: true, name: true, slug: true, status: true },
        },
        productSuppliers: { include: { supplier: true } },
      },
    });

    return NextResponse.json({ product });
  } catch (error: unknown) {
    console.error(`PATCH /api/products/${params.id} failed:`, error);
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
      { message: "Failed to update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { message: `Product ${params.id} not found.` },
        { status: 404 },
      );
    }

    // ProductSupplier rows cascade-delete via the schema's onDelete: Cascade.
    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Product deleted." }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/products/${params.id} failed:`, error);
    return NextResponse.json(
      { message: "Failed to delete product." },
      { status: 500 },
    );
  }
}
