import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { normalizeGtinTo14 } from "@/lib/gs1";
import { PublicShell, InfoRow } from "@/components/public/PublicShell";
import { csvList, formatDate } from "@/lib/utils";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductPublicPage({ params }: { params: { gtin: string } }) {
  const gtin = normalizeGtinTo14(params.gtin);

  const [product, settings] = await Promise.all([
    db.product.findUnique({
      where: { gtin },
      include: {
        producer: true,
        lots: {
          where: { status: { in: ["packed", "shipped", "delivered"] } },
          orderBy: { createdAt: "desc" },
          take: 8,
        },
      },
    }),
    db.settings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
  ]);

  if (!product || !product.isActive) notFound();

  const certifications = csvList(product.certifications);
  const producer = product.producer;

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
          {producer && (
            <InfoRow label="Producer" value={`${producer.name} — ${producer.farmName}`} />
          )}
          <InfoRow label="GTIN" value={product.gtin} />
          <InfoRow label="Packaging" value={[product.packagingType, product.weight].filter(Boolean).join(" · ")} />
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

        {product.description && (
          <p className="mt-5 text-sm leading-relaxed text-ink/80">{product.description}</p>
        )}

        {product.lots.length > 0 && (
          <div className="mt-6">
            <p className="label-eyebrow mb-2">Recent batches</p>
            <ul className="space-y-1">
              {product.lots.map((lot) => (
                <li key={lot.id}>
                  <Link
                    href={`/01/${product.gtin}/10/${encodeURIComponent(lot.lotNumber)}`}
                    className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm hover:bg-pine-50/60"
                  >
                    <span className="font-mono">{lot.lotNumber}</span>
                    <span className="flex items-center gap-1 text-xs text-sage">
                      {formatDate(lot.harvestDate)} <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {producer && producer.isPublic && (
          <Link
            href={`/producer/${producer.id}`}
            className="btn-primary mt-6 w-full"
          >
            View producer
          </Link>
        )}
      </div>
    </PublicShell>
  );
}
