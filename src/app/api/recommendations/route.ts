import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET-only route handlers can otherwise be statically optimized by Next.js
// and cached at build time — force dynamic so this always hits the DB.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recommendations = await prisma.recommendation.findMany({
      include: { clientNeed: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("GET /api/recommendations failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch recommendations." },
      { status: 500 },
    );
  }
}
