import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { TraceabilityChain, type TraceStep } from "@/components/public/TraceabilityChain";
import { LotSelector } from "@/components/admin/LotSelector";
import { formatDate } from "@/lib/utils";

export default async function TraceabilityPage({ searchParams }: { searchParams: { lotId?: string } }) {
  const lots = await db.lot.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  const selectedLotId = searchParams.lotId || lots[0]?.id;
  const lot = selectedLotId
    ? await db.lot.findUnique({
        where: { id: selectedLotId },
        include: { product: { include: { producer: true } }, producer: true, qrCodes: true },
      })
    : null;

  const steps: TraceStep[] = lot
    ? [
        {
          title: lot.producer?.name ?? lot.product.producer?.name ?? "Producer",
          subtitle: [lot.producer?.farmName ?? lot.product.producer?.farmName, lot.producer?.district ?? lot.product.producer?.district]
            .filter(Boolean)
            .join(" · "),
          done: true,
        },
        {
          title: lot.product.name,
          subtitle: `GTIN ${lot.product.gtin}${lot.product.variety ? ` · ${lot.product.variety}` : ""}`,
          done: true,
        },
        {
          title: `Lot ${lot.lotNumber}`,
          subtitle: "Harvested",
          date: lot.harvestDate ? formatDate(lot.harvestDate) : undefined,
          done: Boolean(lot.harvestDate),
        },
        {
          title: "Packing",
          subtitle: lot.storageConditions ?? undefined,
          date: lot.packingDate ? formatDate(lot.packingDate) : undefined,
          done: Boolean(lot.packingDate),
        },
        {
          title: "Shipment",
          subtitle: lot.destination ?? undefined,
          date: lot.shippingDate ? formatDate(lot.shippingDate) : undefined,
          done: Boolean(lot.shippingDate),
        },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Traceability"
        description="Producer → Product → Lot → Packing → Shipment, for any batch."
      />

      <LotSelector lots={lots} selectedLotId={selectedLotId} />

      {!lot ? (
        <p className="text-sage">No lot recorded yet. Create one from Lots &gt; New lot.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr,280px]">
          <div className="card p-6">
            <TraceabilityChain steps={steps} />
          </div>
          <div className="card space-y-3 p-5">
            <p className="label-eyebrow">Quick links</p>
            <Link href={`/admin/lots/${lot.id}`} className="block text-sm text-pine-700 hover:underline">
              Edit this lot
            </Link>
            <Link href={`/admin/products/${lot.productId}`} className="block text-sm text-pine-700 hover:underline">
              View product
            </Link>
            {lot.qrCodes[0] && (
              <a
                href={lot.qrCodes[0].digitalLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-pine-700 hover:underline"
              >
                Open public traceability page
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}