import { NextResponse } from "next/server";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import { formatDate } from "@/lib/utils";

export async function GET() {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const lots = await db.lot.findMany({
    include: { product: true, producer: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = lots.map((l) => ({
    lot_number: l.lotNumber,
    gtin: l.product.gtin,
    product: l.product.name,
    producer: l.producer?.name ?? "",
    harvest_date: formatDate(l.harvestDate),
    packing_date: formatDate(l.packingDate),
    shipping_date: formatDate(l.shippingDate),
    quantity: l.quantity ?? "",
    unit: l.unit ?? "",
    destination: l.destination ?? "",
    storage_conditions: l.storageConditions ?? "",
    status: l.status,
  }));

  const csv = Papa.unparse(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="himalayan-supervores-lots-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
