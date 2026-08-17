import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import { z } from "zod";

const patchSchema = z.object({ isActive: z.coerce.boolean() });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "isActive is required" }, { status: 400 });

  const qrCode = await db.qrCode.update({ where: { id: params.id }, data: { isActive: parsed.data.isActive } });
  return NextResponse.json({ qrCode });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  await db.qrCode.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
