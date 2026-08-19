import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import { z } from "zod";

const eventSchema = z.object({
  type: z.string().min(1, "Event type is required"),
  eventDate: z.coerce.date(),
  location: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const events = await db.lotEvent.findMany({
    where: { lotId: params.id },
    orderBy: { eventDate: "asc" },
  });
  return NextResponse.json({ events });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const body = await req.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const event = await db.lotEvent.create({
    data: { ...parsed.data, lotId: params.id },
  });
  return NextResponse.json({ event }, { status: 201 });
}