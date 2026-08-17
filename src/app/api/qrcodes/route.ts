import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId")?.trim();
  const status = searchParams.get("status");

  const where: Prisma.QrCodeWhereInput = {};
  if (productId) where.productId = productId;
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const qrCodes = await db.qrCode.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { product: true, lot: true },
  });

  return NextResponse.json({ qrCodes });
}
