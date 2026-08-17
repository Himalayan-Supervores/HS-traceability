import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validation";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import { normalizeGtinTo14 } from "@/lib/gs1";
import type { Prisma } from "@prisma/client";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const product = await db.product.findUnique({
    where: { id: params.id },
    include: {
      producer: true,
      lots: { orderBy: { createdAt: "desc" } },
      qrCodes: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const body = await req.json().catch(() => null);
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.gtin) {
    parsed.data.gtin = normalizeGtinTo14(parsed.data.gtin);
    const conflict = await db.product.findFirst({
      where: { gtin: parsed.data.gtin, NOT: { id: params.id } },
    });
    if (conflict) {
      return NextResponse.json({ error: "This GTIN is already assigned to another product." }, { status: 409 });
    }
  }

  const product = await db.product.update({
    where: { id: params.id },
    data: parsed.data as Prisma.ProductUncheckedUpdateInput,
  });
  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const dependentLots = await db.lot.count({ where: { productId: params.id } });
  if (dependentLots > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${dependentLots} lot(s) still reference this product.` },
      { status: 409 }
    );
  }

  await db.qrCode.deleteMany({ where: { productId: params.id } });
  await db.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
