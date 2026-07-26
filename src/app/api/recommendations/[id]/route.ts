import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: params.id },
      include: { clientNeed: true },
    });

    if (!recommendation) {
      return NextResponse.json(
        { message: `Recommendation ${params.id} not found.` },
        { status: 404 },
      );
    }

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error(`GET /api/recommendations/${params.id} failed:`, error);
    return NextResponse.json(
      { message: "Failed to fetch recommendation." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const existing = await prisma.recommendation.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { message: `Recommendation ${params.id} not found.` },
        { status: 404 },
      );
    }

    const body = await request.json().catch(() => null);
    const { reviewed } = body ?? {};

    if (reviewed !== undefined && typeof reviewed !== "boolean") {
      return NextResponse.json(
        { message: "Invalid input: reviewed must be a boolean." },
        { status: 400 },
      );
    }

    const recommendation = await prisma.recommendation.update({
      where: { id: params.id },
      data: {
        reviewed: reviewed !== undefined ? reviewed : !existing.reviewed,
      },
      include: { clientNeed: true },
    });

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error(`PATCH /api/recommendations/${params.id} failed:`, error);
    return NextResponse.json(
      { message: "Failed to update recommendation." },
      { status: 500 },
    );
  }
}
