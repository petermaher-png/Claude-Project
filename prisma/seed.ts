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

  // --- ROADMAP item 7: Internal validation ---
  // Realistic-but-placeholder REDDOT client-need scenarios, standing in for
  // 2-3 real upcoming conversations Peter can run the engine against. Sector/
  // application combos are typical of REDDOT's obstruction-lighting line and
  // are deliberately generic — no real customer names or data.
  const clientNeeds = [
    {
      id: "seed-clientneed-reddot-airport",
      needText:
        "We're upgrading obstruction lighting along the approach path and " +
        "perimeter fencing at a regional airport ahead of next quarter's " +
        "inspection. Looking for medium-intensity red obstruction lights " +
        "on the boundary structures, plus a centralized controller so our " +
        "maintenance team can monitor status and get photocell-based " +
        "on/off switching instead of manual checks. Needs to meet FAA " +
        "AC 150/5345-43 and ICAO Annex 14 requirements since this feeds " +
        "into our annual compliance filing. Budget allows for a phased " +
        "rollout — first the north perimeter, then the rest next fiscal " +
        "year.",
      sector: "Aviation / Airports",
      application: "Airport perimeter and approach lighting compliance",
    },
    {
      id: "seed-clientneed-reddot-telecom-tower",
      needText:
        "Client operates a telecom tower portfolio and just got notice " +
        "that three towers (all around 100-120m) need aviation obstruction " +
        "lighting installed before the local civil aviation authority will " +
        "sign off on the new builds. They want high-intensity lighting " +
        "visible day and night per ICAO Annex 14, and ideally a way to " +
        "remotely confirm each tower's light is functioning without " +
        "sending a technician up — GPS-synced flashing across the towers " +
        "would be a nice-to-have so they don't flash out of sync with " +
        "each other. Power at each site is 220V. They asked for a rough " +
        "lead time since two of the towers are already built and waiting " +
        "on lighting to get their permit finalized.",
      sector: "Telecommunications",
      application: "Telecom tower aviation obstruction lighting",
    },
    {
      id: "seed-clientneed-reddot-wind-farm",
      needText:
        "Wind farm developer reached out about obstruction lighting for " +
        "a new turbine cluster (12 turbines, nacelle height around 140m). " +
        "They need something FAA/ICAO compliant for nighttime and low-" +
        "visibility marking, and they specifically asked whether we can " +
        "supply a monitoring/control unit that can flag a failed light " +
        "back to their SCADA system rather than relying on a site visit — " +
        "the turbines are in a fairly remote location so truck rolls are " +
        "expensive for them. Still early — they want a budgetary quote " +
        "and lead time before this goes to their procurement team.",
      sector: "Renewable Energy",
      application: "Wind turbine obstruction lighting and remote monitoring",
    },
  ];

  for (const clientNeed of clientNeeds) {
    await prisma.clientNeed.upsert({
      where: { id: clientNeed.id },
      update: {},
      create: clientNeed,
    });
  }

  console.log(
    "Seeded internal-validation client-need scenarios:",
    clientNeeds.map((c) => c.application),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
