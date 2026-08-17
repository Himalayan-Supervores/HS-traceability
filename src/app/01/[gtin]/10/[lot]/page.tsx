import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { normalizeGtinTo14 } from "@/lib/gs1";
import { PublicShell, InfoRow } from "@/components/public/PublicShell";
import { TraceabilityChain, type TraceStep } from "@/components/public/TraceabilityChain";
import { csvList, formatDate } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LotPublicPage({ params }: { params: { gtin: string; lot: string } }) {
  const gtin = normalizeGtinTo14(params.gtin);
  const lotNumber = decodeURIComponent(params.lot);

  const [product, settings] = await Promise.all([
    db.product.findUnique({ where: { gtin }, include: { producer: true } }),
    db.settings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
  ]);

  if (!product || !product.isActive) notFound();

  const lot = await db.lot.findFirst({
    where: { lotNumber, productId: product.id },
    include: { producer: true },
  });

  if (!lot) notFound();

  const producer = lot.producer ?? product.producer;
  const certifications = csvList(product.certifications || producer?.certifications || "");

  const steps: TraceStep[] = [
    { title: producer?.name ?? "Producer", subtitle: producer?.farmName, done: Boolean(producer) },
    { title: product.name, subtitle: `GTIN ${product.gtin}`, done: true },
    { title: `Lot ${lot.lotNumber}`, subtitle: "Harvested", date: lot.harvestDate ? formatDate(lot.harvestDate) : undefined, done: Boolean(lot.harvestDate) },
    { title: "Packing", subtitle: lot.storageConditions ?? undefined, date: lot.packingDate ? formatDate(lot.packingDate) : undefined, done: Boolean(lot.packingDate) },
    { title: "Shipment", subtitle: lot.destination ?? undefined, date: lot.shippingDate ? formatDate(lot.shippingDate) : undefined, done: Boolean(lot.shippingDate) },
  ];

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

        <p className="label-eyebrow">{product.category}</p>
        <h1 className="font-display text-3xl leading-tight text-ink">{product.name}</h1>
        {product.variety && <p className="mt-0.5 font-display italic text-ink/60">{product.variety}</p>}

        {product.isDemoGtin && (
          <span className="badge mt-3 bg-marigold-50 text-marigold-600">Demo data — not a real GS1 GTIN</span>
        )}

        <div className="mt-5 divide-y divide-line border-y border-line">
          <InfoRow label="Origin" value={[product.originCountry, product.originRegion].filter(Boolean).join(" — ")} />
          <InfoRow label="Producer" value={producer ? `${producer.name} — ${producer.farmName}` : undefined} />
          <InfoRow label="Batch" value={lot.lotNumber} />
          <InfoRow label="Harvest date" value={lot.harvestDate ? formatDate(lot.harvestDate) : undefined} />
          <InfoRow label="Packing date" value={lot.packingDate ? formatDate(lot.packingDate) : undefined} />
          <InfoRow label="Packaging" value={[product.packagingType, product.weight].filter(Boolean).join(" · ")} />
          <InfoRow label="Storage conditions" value={lot.storageConditions} />
          <InfoRow label="Destination" value={lot.destination} />
        </div>

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

        <div className="mt-8">
          <p className="label-eyebrow mb-4">Traceability</p>
          <TraceabilityChain steps={steps} />
        </div>

        {producer && producer.isPublic && (
          <Link href={`/producer/${producer.id}`} className="btn-primary mt-6 w-full">
            View producer
          </Link>
        )}
      </div>
    </PublicShell>
  );
}
