import { NextResponse } from "next/server";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import { isValidGtinFormat, normalizeGtinTo14 } from "@/lib/gs1";
import { z } from "zod";

const bodySchema = z.object({ csv: z.string().min(1) });

/**
 * Accepts CSV text with (case-insensitive) headers:
 *   gtin, product (or name), variety, producer, origin, category,
 *   certification, sku, weight, packaging
 * Only "gtin" and "product/name" are required. "producer" is matched
 * against an existing producer's name or farm name (case-insensitive);
 * unmatched producer names are imported without a linked producer.
 */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const parsedBody = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Missing CSV content" }, { status: 400 });
  }

  const parsed = Papa.parse<Record<string, string>>(parsedBody.data.csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json({ error: "Could not parse CSV", details: parsed.errors }, { status: 400 });
  }

  const producers = await db.producer.findMany();
  const producerByName = new Map(
    producers.flatMap((p) => [
      [p.name.toLowerCase(), p.id],
      [p.farmName.toLowerCase(), p.id],
    ])
  );

  let created = 0;
  let skipped = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const gtin = (row.gtin || "").trim();
    const name = (row.product || row.name || "").trim();

    if (!gtin || !name) {
      skipped++;
      errors.push({ row: i + 2, message: "Missing gtin or product name" });
      continue;
    }
    if (!isValidGtinFormat(gtin)) {
      skipped++;
      errors.push({ row: i + 2, message: `Invalid GTIN check digit: "${gtin}"` });
      continue;
    }

    const existing = await db.product.findUnique({ where: { gtin: normalizeGtinTo14(gtin) } });
    if (existing) {
      skipped++;
      errors.push({ row: i + 2, message: `GTIN already exists, skipped: ${gtin}` });
      continue;
    }

    const producerName = (row.producer || "").trim();
    const producerId = producerName ? producerByName.get(producerName.toLowerCase()) : undefined;

    try {
      await db.product.create({
        data: {
          gtin: normalizeGtinTo14(gtin),
          name,
          variety: row.variety?.trim() || null,
          category: row.category?.trim() || "General",
          originCountry: row.origin?.trim() || "Nepal",
          certifications: row.certification?.trim() || null,
          sku: row.sku?.trim() || null,
          weight: row.weight?.trim() || null,
          packagingType: row.packaging?.trim() || null,
          producerId: producerId ?? null,
          isDemoGtin: false,
        },
      });
      created++;
    } catch (e) {
      skipped++;
      errors.push({ row: i + 2, message: "Database error while creating this row" });
    }
  }

  return NextResponse.json({ created, skipped, errors, totalRows: parsed.data.length });
}
