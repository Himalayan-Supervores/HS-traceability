import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import { buildGs1_128Text, generateGs1_128Png, generateGs1_128Svg } from "@/lib/barcode";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const lotId = searchParams.get("lotId");
  const format = (searchParams.get("format") ?? "png").toLowerCase();
  if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let lotNumber: string | null = null;
  let packingDate: Date | null = null;
  let netWeightKg: number | null = null;

  if (lotId) {
    const lot = await db.lot.findUnique({ where: { id: lotId } });
    if (!lot || lot.productId !== productId) {
      return NextResponse.json({ error: "Lot not found for this product" }, { status: 404 });
    }
    lotNumber = lot.lotNumber;
    packingDate = lot.packingDate;
    if (lot.quantity && lot.unit?.toLowerCase() === "kg") netWeightKg = lot.quantity;
  }

  const text = buildGs1_128Text(product.gtin, { lotNumber, packingDate, netWeightKg });

  if (format === "svg") {
    const svg = generateGs1_128Svg(text);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `inline; filename="gs1-128-${product.gtin}.svg"`,
      },
    });
  }

  const buffer = await generateGs1_128Png(text);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="gs1-128-${product.gtin}.png"`,
    },
  });
}
