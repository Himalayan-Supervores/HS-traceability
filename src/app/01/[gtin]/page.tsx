import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PublicShell, InfoRow } from "@/components/public/PublicShell";
import { csvList, formatDate } from "@/lib/utils";
import { MapPin, ShieldCheck, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductPublicPage({ params }: { params: { gtin: string } }) {
  const raw = params.gtin;
  const stripped = raw.replace(/^0+/, "");

  const [product, settings] = await Promise.all([
    db.product.findFirst({
      where: {
        OR: [{ gtin: raw }, { gtin: stripped }, { gtin: raw.padStart(14, "0") }],
      },
      include: {
        producer: true,
        lots: { orderBy: { createdAt: "desc" } },
      },
    }),
    db.settings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
  ]);

  if (!product || !product.isActive) notFound();

  const certifications = csvList(product.certifications);
  const producer = product.producer;
  const latestLot = product.lots[0];

  return (
    <PublicShell companyName={settings.companyName}>
      <div className="p-6">
        {product.photoUrl && (
          <img
            src={product.photoUrl}
            alt={product.name}
            className="mb-5 aspect-[4/3] w-full rounded-xl object-cover"
          />
        )}

        <p className="label-eyebrow">Product</p>
        <h1 className="font-display text-3xl leading-tight text-ink">{product.name}</h1>
        {product.variety && <p className="mt-0.5 font-display italic text-ink/60">{product.variety}</p>}

        <p className="mt-3 flex items-center gap-1.5 text-sm text-sage">
          <MapPin className="h-4 w-4" /> {product.originRegion ? `${product.originRegion}, ` : ""}
          {product.originCountry}
        </p>

        {product.description && (
          <p className="mt-5 text-sm leading-relaxed text-ink/80">{product.description}</p>
        )}

        {certifications.length > 0 && (
          <div className="mt-5">
            <p className="label-eyebrow mb-2">Certification</p>
            <div className="flex flex-wrap gap-2">
              {certifications.map((c) => (
                <span key={c} className="badge bg-pine-50 text-pine-700">
                  <ShieldCheck className="h-3 w-3" /> {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-line pt-4">
          <InfoRow label="GTIN" value={product.gtin} />
          <InfoRow label="Category" value={product.category} />
          <InfoRow label="Selling unit" value={product.sellingUnit} />
          <InfoRow label="Weight" value={product.weight} />
          <InfoRow label="Packaging" value={product.packagingType} />
        </div>

        {producer && (
          <div className="mt-6 border-t border-line pt-4">
            <p className="label-eyebrow mb-2">Producer</p>
            <Link
              href={`/producer/${producer.id}`}
              className="block rounded-md border border-line px-3 py-2 text-sm hover:bg-pine-50/60"
            >
              {producer.name} — <span className="text-sage">{producer.farmName}</span>
            </Link>
          </div>
        )}

        {latestLot && (
          <div className="mt-6 border-t border-line pt-4">
            <p className="label-eyebrow mb-2 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> Batch traceability
            </p>
            <InfoRow label="Lot number" value={latestLot.lotNumber} />
            <InfoRow label="Harvest date" value={formatDate(latestLot.harvestDate)} />
            <InfoRow label="Packing date" value={formatDate(latestLot.packingDate)} />
            <InfoRow label="Shipping date" value={formatDate(latestLot.shippingDate)} />
            <InfoRow label="Best before" value={formatDate(latestLot.expiryDate)} />
            <InfoRow label="Destination" value={latestLot.destination} />
            <InfoRow label="Quantity" value={latestLot.quantity ? `${latestLot.quantity} ${latestLot.unit || ""}` : undefined} />
            <InfoRow label="Storage conditions" value={latestLot.storageConditions} />
          </div>
        )}
      </div>
    </PublicShell>
  );
}