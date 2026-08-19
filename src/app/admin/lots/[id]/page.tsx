import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, DeleteButton } from "@/components/admin/ui";
import { LotForm } from "@/components/admin/LotForm";
import { QrCodeCard } from "@/components/admin/QrCodeCard";
import { LotEvents } from "@/components/admin/LotEvents";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function LotDetailPage({ params }: { params: { id: string } }) {
  const [lot, products, producers] = await Promise.all([
        db.lot.findUnique({
      where: { id: params.id },
      include: {
        qrCodes: { where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 1 },
        events: { orderBy: { eventDate: "asc" } },
      },
    }),
    db.product.findMany({ orderBy: { name: "asc" } }),
    db.producer.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!lot) notFound();

  const qrCode = lot.qrCodes[0]
    ? {
        id: lot.qrCodes[0].id,
        digitalLinkUrl: lot.qrCodes[0].digitalLinkUrl,
        isActive: lot.qrCodes[0].isActive,
        createdAt: lot.qrCodes[0].createdAt.toISOString(),
      }
    : null;

  return (
    <div>
      <PageHeader
        title={`Lot ${lot.lotNumber}`}
        action={
          <DeleteButton
            endpoint={`/api/lots/${lot.id}`}
            confirmLabel="Delete this lot and its QR Codes?"
            redirectTo="/admin/lots"
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <LotForm
          products={products}
          producers={producers}
          initial={{
            id: lot.id,
            lotNumber: lot.lotNumber,
            productId: lot.productId,
            producerId: lot.producerId ?? "",
            harvestDate: toDateInput(lot.harvestDate),
            packingDate: toDateInput(lot.packingDate),
            shippingDate: toDateInput(lot.shippingDate),
            expiryDate: toDateInput(lot.expiryDate),
            quantity: lot.quantity?.toString() ?? "",
            unit: lot.unit ?? "",
            destination: lot.destination ?? "",
            storageConditions: lot.storageConditions ?? "",
            status: lot.status as "in_production" | "packed" | "shipped" | "delivered",
          }}
        />

                <div className="space-y-6">
          <QrCodeCard productId={lot.productId} lotId={lot.id} initialQrCode={qrCode} />
          <LotEvents
            lotId={lot.id}
            initialEvents={lot.events.map((e) => ({
              id: e.id,
              type: e.type,
              eventDate: e.eventDate.toISOString(),
              location: e.location,
              note: e.note,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
