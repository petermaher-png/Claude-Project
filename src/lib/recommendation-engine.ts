// Recommendation engine — implemented in ROADMAP issue 6.
import { prisma } from "@/lib/db";
import {
  generateRecommendation,
  type RecommendationCandidateProduct,
} from "@/lib/claude";
import type { Prisma, Recommendation } from "@prisma/client";

export class RecommendationEngineError extends Error {
  constructor(
    message: string,
    public readonly kind: "not_found" | "no_candidates" | "config" | "claude" | "unknown",
  ) {
    super(message);
    this.name = "RecommendationEngineError";
  }
}

async function getCandidateProducts(): Promise<RecommendationCandidateProduct[]> {
  // v1 simplification: no per-category filtering by sector/application/specs yet —
  // every product on an ACTIVE line is a candidate. Future versions should narrow
  // this further using the client need's structured fields.
  const products = await prisma.product.findMany({
    where: {
      productLine: { status: "ACTIVE" },
    },
    include: {
      productLine: { select: { name: true, slug: true } },
      productSuppliers: { include: { supplier: true } },
    },
    orderBy: [{ productLine: { name: "asc" } }, { name: "asc" }],
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    specs: product.specs,
    certificationNotes: product.certificationNotes,
    certifications: product.certifications,
    productLine: {
      name: product.productLine.name,
      slug: product.productLine.slug,
    },
    suppliers: product.productSuppliers.map((ps) => ({
      supplierName: ps.supplier.name,
      pricingBands: ps.pricingBands,
      leadTimeDays: ps.leadTimeDays,
      paymentTerms: ps.paymentTerms,
    })),
  }));
}

export async function buildRecommendation(
  clientNeedId: string,
): Promise<Recommendation> {
  const clientNeed = await prisma.clientNeed.findUnique({
    where: { id: clientNeedId },
  });

  if (!clientNeed) {
    throw new RecommendationEngineError(
      `Client need ${clientNeedId} not found.`,
      "not_found",
    );
  }

  const candidateProducts = await getCandidateProducts();
  if (candidateProducts.length === 0) {
    throw new RecommendationEngineError(
      "No products found on an ACTIVE product line. Add or activate at least one product before generating recommendations.",
      "no_candidates",
    );
  }

  let generated;
  try {
    generated = await generateRecommendation({
      needText: clientNeed.needText,
      sector: clientNeed.sector,
      application: clientNeed.application,
      candidateProducts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("ANTHROPIC_API_KEY is not configured")) {
      throw new RecommendationEngineError(message, "config");
    }
    throw new RecommendationEngineError(
      `Recommendation generation failed: ${message}`,
      "claude",
    );
  }

  const recommendation = await prisma.recommendation.create({
    data: {
      clientNeedId: clientNeed.id,
      proposal: generated.proposal as Prisma.InputJsonValue,
      reasoning: generated.reasoning,
      reviewed: false,
    },
  });

  return recommendation;
}
