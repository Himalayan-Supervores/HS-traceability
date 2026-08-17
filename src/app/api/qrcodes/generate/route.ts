import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import { buildDigitalLinkUrl } from "@/lib/gs1";
import { resolveBaseDomain } from "@/lib/utils";
import { z } from "zod";

const bodySchema = z.object({
  productId: z.string().min(1),
  lotId: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  const { productId, lotId } = parsed.data;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let lotNumber: string | undefined;
  if (lotId) {
    const lot = await db.lot.findUnique({ where: { id: lotId } });
    if (!lot) return NextResponse.json({ error: "Lot not found" }, { status: 404 });
    if (lot.productId !== productId) {
      return NextResponse.json({ error: "This lot does not belong to the selected product" }, { status: 400 });
    }
    lotNumber = lot.lotNumber;
  }

  // Reuse an existing active QR Code for the exact same (GTIN, lot) pair —
  // the whole point of GS1 Digital Link is that the URL never has to change.
  const existing = await db.qrCode.findFirst({
    where: { productId, lotId: lotId ?? null, isActive: true },
  });
  if (existing) {
    return NextResponse.json({ qrCode: existing });
  }

  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  const domain = resolveBaseDomain(settings?.domain);
  const digitalLinkUrl = buildDigitalLinkUrl(domain, product.gtin, lotNumber);

  const qrCode = await db.qrCode.create({
    data: {
      gtin: product.gtin,
      productId,
      lotId: lotId ?? null,
      digitalLinkUrl,
    },
  });

  return NextResponse.json({ qrCode }, { status: 201 });
}
