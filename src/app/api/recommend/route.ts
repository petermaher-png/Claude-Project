import { NextRequest, NextResponse } from "next/server";
import {
  buildRecommendation,
  RecommendationEngineError,
} from "@/lib/recommendation-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const clientNeedId = body?.clientNeedId;

    if (typeof clientNeedId !== "string" || clientNeedId.trim() === "") {
      return NextResponse.json(
        { message: "Invalid input: clientNeedId is required." },
        { status: 400 },
      );
    }

    const recommendation = await buildRecommendation(clientNeedId);
    return NextResponse.json({ recommendation }, { status: 201 });
  } catch (error) {
    if (error instanceof RecommendationEngineError) {
      switch (error.kind) {
        case "not_found":
          return NextResponse.json({ message: error.message }, { status: 404 });
        case "no_candidates":
          return NextResponse.json({ message: error.message }, { status: 422 });
        case "config":
          return NextResponse.json(
            {
              message: `Configuration problem: ${error.message}`,
            },
            { status: 503 },
          );
        case "claude":
          return NextResponse.json(
            { message: error.message },
            { status: 503 },
          );
        default:
          return NextResponse.json({ message: error.message }, { status: 500 });
      }
    }

    console.error("POST /api/recommend failed:", error);
    return NextResponse.json(
      { message: "Failed to generate recommendation." },
      { status: 500 },
    );
  }
}
