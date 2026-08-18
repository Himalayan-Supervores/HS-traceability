import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildDigitalLinkUrl } from "../src/lib/gs1";

const db = new PrismaClient();

// ---------------------------------------------------------------------------
// Demo GTINs below all start with prefix "2" — the GS1 "Restricted
// Circulation Number within a company" range, explicitly reserved by GS1
// for internal/demo use and NOT globally unique. They are flagged
// isDemoGtin=true and shown with a "DEMO" badge everywhere in the UI.
// Replace them with GTINs actually licensed to the company before going
// live — see README.md "Going live with real GTINs".
// ---------------------------------------------------------------------------

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@himalayansupervores.example";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  await db.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Himalayan Supervores Administrator",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });
  console.log(`Admin account ready: ${adminEmail}`);

  const settings = await db.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      companyName: "Himalayan Supervores",
      domain: process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, "") || "localhost:3000",
      country: "Nepal",
      contactEmail: "export@himalayansupervores.example",
    },
  });

  const himalayan = await db.producer.upsert({
    where: { id: "seed-producer-himalayan" },
    update: {},
    create: {
      id: "seed-producer-himalayan",
      name: "Himalayan Farm",
      farmName: "Himalayan Farm Cooperative",
      country: "Nepal",
      province: "Bagmati",
      district: "Chitwan",
      municipality: "Bharatpur",
      address: "Ward 12, Bharatpur, Chitwan",
      contactName: "Ram Bahadur Thapa",
      contactPhone: "+977 98010 00001",
      email: "contact@himalayanfarm.example",
      certifications: "GlobalG.A.P., Organic Nepal",
      description:
        "A family-run cooperative in the fertile Chitwan valley, growing mangoes and ginger for export since 2011.",
      isActive: true,
      isPublic: true,
    },
  });

  const chitwanAgro = await db.producer.upsert({
    where: { id: "seed-producer-chitwan-agro" },
    update: {},
    create: {
      id: "seed-producer-chitwan-agro",
      name: "Chitwan Agro Farm",
      farmName: "Chitwan Agro Farm Pvt. Ltd.",
      country: "Nepal",
      province: "Bagmati",
      district: "Chitwan",
      municipality: "Ratnanagar",
      contactName: "Sita Gurung",
      contactPhone: "+977 98010 00002",
      email: "contact@chitwanagro.example",
      certifications: "Organic Nepal",
      description: "Vegetable specialist supplying green beans and pumpkin shoots to regional and export markets.",
      isActive: true,
      isPublic: true,
    },
  });

  const kathmanduMushroom = await db.producer.upsert({
    where: { id: "seed-producer-kathmandu-mushroom" },
    update: {},
    create: {
      id: "seed-producer-kathmandu-mushroom",
      name: "Kathmandu Mushroom Farm",
      farmName: "Kathmandu Mushroom Farm",
      country: "Nepal",
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "Budhanilkantha",
      contactName: "Prakash Shrestha",
      contactPhone: "+977 98010 00003",
      email: "contact@ktmmushroom.example",
      certifications: "HACCP",
      description: "Controlled-environment mushroom cultivation, including oyster mushroom and wild fiddlehead ferns sourcing.",
      isActive: true,
      isPublic: true,
    },
  });

  type ProductSeed = {
    id: string;
    gtin: string;
    name: string;
    nameEn?: string;
    category: string;
    variety?: string;
    description: string;
    producerId: string;
    originRegion: string;
    sellingUnit: string;
    weight: string;
    packagingType: string;
    certifications?: string;
  };

  const products: ProductSeed[] = [
    {
      id: "seed-product-mango",
      gtin: "2000090000018",
      name: "Mango",
      nameEn: "Mango",
      category: "Fruit",
      variety: "Alphonso",
      description: "Sun-ripened Alphonso mangoes, hand-picked at optimal maturity for export.",
      producerId: himalayan.id,
      originRegion: "Chitwan",
      sellingUnit: "carton",
      weight: "5 kg",
      packagingType: "5 kg ventilated carton",
      certifications: "GlobalG.A.P.",
    },
    {
      id: "seed-product-ginger",
      gtin: "2000090000025",
      name: "Ginger",
      category: "Vegetable",
      variety: "Nepali local",
      description: "Fresh root ginger, washed and graded, known for its high oil content and pungency.",
      producerId: himalayan.id,
      originRegion: "Chitwan",
      sellingUnit: "crate",
      weight: "10 kg",
      packagingType: "10 kg mesh crate",
      certifications: "Organic Nepal",
    },
    {
      id: "seed-product-oyster-mushroom",
      gtin: "2000090000032",
      name: "Oyster Mushroom",
      category: "Mushroom",
      description: "Fresh oyster mushrooms grown in a controlled environment, harvested within 24h of dispatch.",
      producerId: kathmanduMushroom.id,
      originRegion: "Kathmandu",
      sellingUnit: "punnet",
      weight: "200 g",
      packagingType: "200 g ventilated punnet",
      certifications: "HACCP",
    },
    {
      id: "seed-product-green-beans",
      gtin: "2000090000049",
      name: "Green Beans",
      category: "Vegetable",
      variety: "French bean",
      description: "Slender French green beans, hand-sorted for uniform size and export-grade quality.",
      producerId: chitwanAgro.id,
      originRegion: "Chitwan",
      sellingUnit: "carton",
      weight: "4 kg",
      packagingType: "4 kg carton",
      certifications: "Organic Nepal",
    },
    {
      id: "seed-product-pumpkin-shoots",
      gtin: "2000090000056",
      name: "Pumpkin Shoots",
      category: "Vegetable",
      description: "Tender pumpkin vine shoots, a Himalayan speciality vegetable increasingly sought after abroad.",
      producerId: chitwanAgro.id,
      originRegion: "Chitwan",
      sellingUnit: "bundle",
      weight: "500 g",
      packagingType: "500 g bundle",
    },
    {
      id: "seed-product-fiddlehead-ferns",
      gtin: "2000090000063",
      name: "Fiddlehead Ferns",
      nameEn: "Fiddlehead Ferns (Niguro)",
      category: "Vegetable",
      description: "Wild-foraged fiddlehead ferns from mid-hill forests, prized for their earthy flavour.",
      producerId: kathmanduMushroom.id,
      originRegion: "Kathmandu hills",
      sellingUnit: "bag",
      weight: "1 kg",
      packagingType: "1 kg vacuum bag",
    },
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        gtin: p.gtin,
        isDemoGtin: true,
        name: p.name,
        nameEn: p.nameEn,
        category: p.category,
        variety: p.variety,
        description: p.description,
        producerId: p.producerId,
        originCountry: "Nepal",
        originRegion: p.originRegion,
        sellingUnit: p.sellingUnit,
        weight: p.weight,
        packagingType: p.packagingType,
        certifications: p.certifications,
        isActive: true,
      },
    });
  }
  console.log(`${products.length} demo products ready.`);

  // One representative lot + QR Code per product, staggered over recent days.
  const today = new Date();
  const daysAgo = (n: number) => new Date(today.getTime() - n * 24 * 60 * 60 * 1000);

  const lotSeeds = [
    { productId: "seed-product-mango", lotNumber: "MNG26081601", producerId: himalayan.id, destination: "Rotterdam, Netherlands", status: "shipped", harvest: 6, pack: 5, ship: 3 },
    { productId: "seed-product-ginger", lotNumber: "GIN26081102", producerId: himalayan.id, destination: "Dubai, UAE", status: "packed", harvest: 4, pack: 2, ship: null },
    { productId: "seed-product-oyster-mushroom", lotNumber: "OYM26081701", producerId: kathmanduMushroom.id, destination: "Doha, Qatar", status: "in_production", harvest: 1, pack: null, ship: null },
    { productId: "seed-product-green-beans", lotNumber: "GRB26081003", producerId: chitwanAgro.id, destination: "Hamburg, Germany", status: "delivered", harvest: 10, pack: 9, ship: 7 },
    { productId: "seed-product-pumpkin-shoots", lotNumber: "PMS26081201", producerId: chitwanAgro.id, destination: "Abu Dhabi, UAE", status: "packed", harvest: 3, pack: 2, ship: null },
    { productId: "seed-product-fiddlehead-ferns", lotNumber: "FHF26080901", producerId: kathmanduMushroom.id, destination: "Paris, France", status: "shipped", harvest: 8, pack: 7, ship: 5 },
  ] as const;

  for (const l of lotSeeds) {
    await db.lot.upsert({
      where: { lotNumber: l.lotNumber },
      update: {},
      create: {
        lotNumber: l.lotNumber,
        productId: l.productId,
        producerId: l.producerId,
        harvestDate: daysAgo(l.harvest),
        packingDate: l.pack != null ? daysAgo(l.pack) : null,
        shippingDate: l.ship != null ? daysAgo(l.ship) : null,
        quantity: 480,
        unit: "kg",
        destination: l.destination,
        storageConditions: "Cold chain, 8-10°C, 85-90% relative humidity",
        status: l.status,
      },
    });
  }
  console.log(`${lotSeeds.length} demo lots ready.`);

  // Generate one lot-level QR Code per seeded lot so the demo is scannable immediately.
  for (const l of lotSeeds) {
    const product = await db.product.findUniqueOrThrow({ where: { id: l.productId } });
    const lot = await db.lot.findUniqueOrThrow({ where: { lotNumber: l.lotNumber } });
    const existing = await db.qrCode.findFirst({ where: { productId: product.id, lotId: lot.id } });
    if (existing) continue;
    await db.qrCode.create({
      data: {
        gtin: product.gtin,
        productId: product.id,
        lotId: lot.id,
        digitalLinkUrl: buildDigitalLinkUrl(settings.domain, product.gtin, lot.lotNumber),
      },
    });
  }
  console.log("Demo QR Codes generated.");

  console.log("\nSeed complete.");
  console.log(`Log in at /login with ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
