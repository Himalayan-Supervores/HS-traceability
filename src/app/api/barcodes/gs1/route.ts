import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import { generateGs1BarcodePng, generateGs1BarcodeSvg } from "@/lib/barcode";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const format = (searchParams.get("format") ?? "png").toLowerCase();
  if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  if (format === "svg") {
    const { svg } = generateGs1BarcodeSvg(product.gtin);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `inline; filename="barcode-${product.gtin}.svg"`,
      },
    });
  }

  const { buffer } = await generateGs1BarcodePng(product.gtin);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="barcode-${product.gtin}.png"`,
    },
  });
}
