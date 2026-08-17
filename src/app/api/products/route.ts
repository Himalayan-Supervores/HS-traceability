import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validation";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import { normalizeGtinTo14 } from "@/lib/gs1";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const producerId = searchParams.get("producerId")?.trim();
  const certification = searchParams.get("certification")?.trim();
  const status = searchParams.get("status");

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { gtin: { contains: q, mode: "insensitive" } },
      { variety: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = { equals: category, mode: "insensitive" };
  if (producerId) where.producerId = producerId;
  if (certification) where.certifications = { contains: certification, mode: "insensitive" };
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const products = await db.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { producer: true, _count: { select: { lots: true, qrCodes: true } } },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const normalizedGtin = normalizeGtinTo14(parsed.data.gtin);
  const existing = await db.product.findUnique({ where: { gtin: normalizedGtin } });
  if (existing) {
    return NextResponse.json({ error: "This GTIN is already assigned to another product." }, { status: 409 });
  }

  // GS1 Digital Link always expresses the GTIN AI (01) as 14 digits — store
  // the canonical form so resolver lookups are a simple equality check.
  const product = await db.product.create({
    data: { ...parsed.data, gtin: normalizedGtin } as Prisma.ProductUncheckedCreateInput,
  });
  return NextResponse.json({ product }, { status: 201 });
}
