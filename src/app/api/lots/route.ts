import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lotSchema } from "@/lib/validation";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status")?.trim();
  const productId = searchParams.get("productId")?.trim();

  const where: Prisma.LotWhereInput = {};
  if (q) {
    where.OR = [
      { lotNumber: { contains: q, mode: "insensitive" } },
      { destination: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (productId) where.productId = productId;

  const lots = await db.lot.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { product: true, producer: true, _count: { select: { qrCodes: true } } },
  });

  return NextResponse.json({ lots });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const body = await req.json().catch(() => null);
  const parsed = lotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.lot.findUnique({ where: { lotNumber: parsed.data.lotNumber } });
  if (existing) {
    return NextResponse.json({ error: "This lot number already exists." }, { status: 409 });
  }

  const lot = await db.lot.create({ data: parsed.data as Prisma.LotUncheckedCreateInput });
  return NextResponse.json({ lot }, { status: 201 });
}
