import { NextResponse } from "next/server";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";

export async function GET() {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const products = await db.product.findMany({
    include: { producer: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = products.map((p) => ({
    gtin: p.gtin,
    sku: p.sku ?? "",
    product: p.name,
    name_en: p.nameEn ?? "",
    category: p.category,
    variety: p.variety ?? "",
    producer: p.producer?.name ?? "",
    origin: p.originCountry,
    origin_region: p.originRegion ?? "",
    packaging: p.packagingType ?? "",
    weight: p.weight ?? "",
    certification: p.certifications ?? "",
    active: p.isActive ? "yes" : "no",
    demo_gtin: p.isDemoGtin ? "yes" : "no",
  }));

  const csv = Papa.unparse(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="himalayan-supervores-products-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
