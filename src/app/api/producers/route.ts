import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { producerSchema } from "@/lib/validation";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const district = searchParams.get("district")?.trim();
  const status = searchParams.get("status"); // active | inactive | all

  const where: Prisma.ProducerWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { farmName: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
    ];
  }
  if (district) where.district = { equals: district, mode: "insensitive" };
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const producers = await db.producer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true, lots: true } } },
  });

  return NextResponse.json({ producers });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const body = await req.json().catch(() => null);
  const parsed = producerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const producer = await db.producer.create({ data: parsed.data as Prisma.ProducerCreateInput });
  return NextResponse.json({ producer }, { status: 201 });
}
