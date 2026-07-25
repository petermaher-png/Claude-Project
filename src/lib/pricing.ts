import { Prisma } from "@prisma/client";

type PricingBand = {
  minQty?: number;
  maxQty?: number | null;
  unitPrice?: number;
  currency?: string;
};

function isPricingBandArray(value: Prisma.JsonValue): value is PricingBand[] {
  return Array.isArray(value);
}

/**
 * pricingBands is stored as loosely-typed JSON (shape varies by supplier quote),
 * so this defensively extracts the lowest unitPrice across bands instead of
 * assuming a fixed structure.
 */
export function lowestUnitPrice(
  pricingBands: Prisma.JsonValue,
): { unitPrice: number; currency: string } | null {
  if (!isPricingBandArray(pricingBands)) return null;

  let lowest: { unitPrice: number; currency: string } | null = null;
  for (const band of pricingBands) {
    if (typeof band?.unitPrice !== "number") continue;
    if (!lowest || band.unitPrice < lowest.unitPrice) {
      lowest = {
        unitPrice: band.unitPrice,
        currency: typeof band.currency === "string" ? band.currency : "USD",
      };
    }
  }
  return lowest;
}
