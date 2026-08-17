import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settingsSchema } from "@/lib/validation";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";

export async function GET() {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const settings = await db.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const parsed = settingsSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = await db.settings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });
  return NextResponse.json({ settings });
}
