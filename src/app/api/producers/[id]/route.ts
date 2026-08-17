import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { producerSchema } from "@/lib/validation";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const producer = await db.producer.findUnique({
    where: { id: params.id },
    include: { products: true, lots: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!producer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ producer });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const body = await req.json().catch(() => null);
  const parsed = producerSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const producer = await db.producer.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ producer });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const dependentProducts = await db.product.count({ where: { producerId: params.id } });
  if (dependentProducts > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${dependentProducts} product(s) still reference this producer.` },
      { status: 409 }
    );
  }

  await db.producer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
