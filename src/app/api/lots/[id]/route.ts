import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lotSchema } from "@/lib/validation";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import type { Prisma } from "@prisma/client";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const lot = await db.lot.findUnique({
    where: { id: params.id },
    include: { product: { include: { producer: true } }, producer: true, qrCodes: true },
  });
  if (!lot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ lot });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const body = await req.json().catch(() => null);
  const parsed = lotSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lot = await db.lot.update({
    where: { id: params.id },
    data: parsed.data as Prisma.LotUncheckedUpdateInput,
  });
  return NextResponse.json({ lot });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  await db.qrCode.deleteMany({ where: { lotId: params.id } });
  await db.lot.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
