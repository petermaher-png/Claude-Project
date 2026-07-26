import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const clientNeeds = await prisma.clientNeed.findMany({
      include: {
        _count: {
          select: { recommendations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ clientNeeds });
  } catch (error) {
    console.error("GET /api/client-needs failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch client needs." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { needText, sector, application } = body ?? {};

    if (typeof needText !== "string" || needText.trim() === "") {
      return NextResponse.json(
        { message: "Invalid input: needText is required." },
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

    const clientNeed = await prisma.clientNeed.create({
      data: {
        needText: needText.trim(),
        sector: sector?.trim() || null,
        application: application?.trim() || null,
      },
      include: {
        _count: {
          select: { recommendations: true },
        },
      },
    });

    return NextResponse.json({ clientNeed }, { status: 201 });
  } catch (error) {
    console.error("POST /api/client-needs failed:", error);
    return NextResponse.json(
      { message: "Failed to create client need." },
      { status: 500 },
    );
  }
}
