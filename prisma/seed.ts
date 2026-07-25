import { PrismaClient, ProductLineStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const reddotLine = await prisma.productLine.upsert({
    where: { slug: "reddot" },
    update: {},
    create: {
      name: "REDDOT",
      slug: "reddot",
      status: ProductLineStatus.ACTIVE,
      description: "Aviation obstruction lighting — Phase 1 pilot line.",
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { id: "seed-supplier-reddot" },
    update: {},
    create: {
      id: "seed-supplier-reddot",
      name: "REDDOT Manufacturing (placeholder)",
      contactEmail: "sales@reddot.example",
      contactPerson: "Placeholder Contact",
      notes: "Seed data only — replace with real supplier terms.",
    },
  });

  const products = [
    {
      sku: "RD-OL-120",
      name: "Medium Intensity Obstruction Light",
      specs: {
        intensity: "2000 cd",
        voltage: "120 VAC",
        beamSpread: "360° horizontal",
        color: "aviation red",
      },
      certificationNotes: "FAA AC 150/5345-43L compliant (placeholder)",
      certifications: {
        faa: "AC 150/5345-43L",
        icao: "Annex 14 Vol I",
      },
      pricingBands: [
        { minQty: 1, maxQty: 9, unitPrice: 850, currency: "USD" },
        { minQty: 10, maxQty: null, unitPrice: 720, currency: "USD" },
      ],
      leadTimeDays: 21,
      paymentTerms: "Net 30",
    },
    {
      sku: "RD-OL-220",
      name: "High Intensity Obstruction Light",
      specs: {
        intensity: "200000 cd (day) / 20000 cd (night)",
        voltage: "220 VAC",
        flashRate: "40 fpm",
        color: "aviation white/red",
      },
      certificationNotes: "ICAO Annex 14 compliant (placeholder)",
      certifications: {
        faa: "AC 150/5345-43H",
        icao: "Annex 14 Vol I",
      },
      pricingBands: [
        { minQty: 1, maxQty: 4, unitPrice: 4200, currency: "USD" },
        { minQty: 5, maxQty: null, unitPrice: 3800, currency: "USD" },
      ],
      leadTimeDays: 35,
      paymentTerms: "50% deposit, balance Net 30",
    },
    {
      sku: "RD-CTL-01",
      name: "Obstruction Light Controller",
      specs: {
        inputs: 4,
        outputs: 8,
        monitoring: "photocell + GPS sync",
        enclosure: "NEMA 4X",
      },
      certificationNotes: "UL listed enclosure (placeholder)",
      certifications: {
        ul: "508A panel",
      },
      pricingBands: [
        { minQty: 1, maxQty: null, unitPrice: 1100, currency: "USD" },
      ],
      leadTimeDays: 14,
      paymentTerms: "Net 30",
    },
  ];

  for (const item of products) {
    const { pricingBands, leadTimeDays, paymentTerms, ...productData } = item;

    const product = await prisma.product.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        ...productData,
        productLineId: reddotLine.id,
      },
    });

    await prisma.productSupplier.upsert({
      where: {
        productId_supplierId: {
          productId: product.id,
          supplierId: supplier.id,
        },
      },
      update: {},
      create: {
        productId: product.id,
        supplierId: supplier.id,
        pricingBands,
        leadTimeDays,
        paymentTerms,
      },
    });
  }

  console.log("Seeded REDDOT placeholder data:", {
    productLine: reddotLine.slug,
    products: products.map((p) => p.sku),
    supplier: supplier.name,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
