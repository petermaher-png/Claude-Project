import { NextRequest, NextResponse } from "next/server";
import { Prisma, ValidationOutcome } from "@prisma/client";
import { prisma } from "@/lib/db";

type RouteParams = { params: { id: string } };

const VALIDATION_OUTCOMES = Object.values(ValidationOutcome);

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
    const { reviewed, validationOutcome, validationNotes } = body ?? {};

    if (reviewed !== undefined && typeof reviewed !== "boolean") {
      return NextResponse.json(
        { message: "Invalid input: reviewed must be a boolean." },
        { status: 400 },
      );
    }

    if (
      validationOutcome !== undefined &&
      !VALIDATION_OUTCOMES.includes(validationOutcome)
    ) {
      return NextResponse.json(
        {
          message: `Invalid input: validationOutcome must be one of ${VALIDATION_OUTCOMES.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    if (
      validationNotes !== undefined &&
      validationNotes !== null &&
      typeof validationNotes !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid input: validationNotes must be a string." },
        { status: 400 },
      );
    }

    const data: Prisma.RecommendationUpdateInput = {};

    if (reviewed !== undefined) {
      data.reviewed = reviewed;
    } else if (validationOutcome === undefined && validationNotes === undefined) {
      // No recognized fields sent — fall back to the original toggle
      // behavior so existing callers of the plain reviewed button keep working.
      data.reviewed = !existing.reviewed;
    }
    if (validationOutcome !== undefined) {
      data.validationOutcome = validationOutcome as ValidationOutcome;
    }
    if (validationNotes !== undefined) {
      data.validationNotes = validationNotes === "" ? null : validationNotes;
    }

    const recommendation = await prisma.recommendation.update({
      where: { id: params.id },
      data,
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
