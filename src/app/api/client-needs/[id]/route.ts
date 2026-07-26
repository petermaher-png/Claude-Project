import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const clientNeed = await prisma.clientNeed.findUnique({
      where: { id: params.id },
      include: {
        recommendations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!clientNeed) {
      return NextResponse.json(
        { message: `Client need ${params.id} not found.` },
        { status: 404 },
      );
    }

    return NextResponse.json({ clientNeed });
  } catch (error) {
    console.error(`GET /api/client-needs/${params.id} failed:`, error);
    return NextResponse.json(
      { message: "Failed to fetch client need." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const existing = await prisma.clientNeed.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { message: `Client need ${params.id} not found.` },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { needText, sector, application } = body ?? {};

    if (
      needText !== undefined &&
      (typeof needText !== "string" || needText.trim() === "")
    ) {
      return NextResponse.json(
        { message: "Invalid input: needText must be a non-empty string." },
        { status: 400 },
      );
    }
    if (sector !== undefined && sector !== null && typeof sector !== "string") {
      return NextResponse.json(
        { message: "Invalid input: sector must be a string." },
        { status: 400 },
      );
    }
    if (
      application !== undefined &&
      application !== null &&
      typeof application !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid input: application must be a string." },
        { status: 400 },
      );
    }

    const clientNeed = await prisma.clientNeed.update({
      where: { id: params.id },
      data: {
        ...(needText !== undefined ? { needText: needText.trim() } : {}),
        ...(sector !== undefined ? { sector: sector?.trim() || null } : {}),
        ...(application !== undefined
          ? { application: application?.trim() || null }
          : {}),
      },
      include: {
        _count: {
          select: { recommendations: true },
        },
      },
    });

    return NextResponse.json({ clientNeed });
  } catch (error) {
    console.error(`PATCH /api/client-needs/${params.id} failed:`, error);
    return NextResponse.json(
      { message: "Failed to update client need." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const existing = await prisma.clientNeed.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { message: `Client need ${params.id} not found.` },
        { status: 404 },
      );
    }

    // Recommendation rows cascade-delete via the schema's onDelete: Cascade.
    await prisma.clientNeed.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Client need deleted." }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/client-needs/${params.id} failed:`, error);
    return NextResponse.json(
      { message: "Failed to delete client need." },
      { status: 500 },
    );
  }
}
