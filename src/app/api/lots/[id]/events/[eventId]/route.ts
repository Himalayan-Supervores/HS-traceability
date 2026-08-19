import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";

export async function DELETE(req: Request, { params }: { params: { eventId: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  await db.lotEvent.delete({ where: { id: params.eventId } });
  return NextResponse.json({ ok: true });
}