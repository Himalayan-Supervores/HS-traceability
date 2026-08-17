import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, DeleteButton } from "@/components/admin/ui";
import { LotForm } from "@/components/admin/LotForm";
import { QrCodeCard } from "@/components/admin/QrCodeCard";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function LotDetailPage({ params }: { params: { id: string } }) {
  const [lot, products, producers] = await Promise.all([
    db.lot.findUnique({
      where: { id: params.id },
      include: { qrCodes: { where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 1 } },
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
            quantity: lot.quantity?.toString() ?? "",
            unit: lot.unit ?? "",
            destination: lot.destination ?? "",
            storageConditions: lot.storageConditions ?? "",
            status: lot.status as "in_production" | "packed" | "shipped" | "delivered",
          }}
        />

        <QrCodeCard productId={lot.productId} lotId={lot.id} initialQrCode={qrCode} />
      </div>
    </div>
  );
}
