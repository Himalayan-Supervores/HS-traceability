import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { QrCodesTable } from "@/components/admin/QrCodesTable";

export default async function QrCodesPage() {
  const qrCodes = await db.qrCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true, lot: true },
  });

  const rows = qrCodes.map((q) => ({
    id: q.id,
    gtin: q.gtin,
    productId: q.productId,
    productName: q.product.name,
    lotNumber: q.lot?.lotNumber ?? null,
    digitalLinkUrl: q.digitalLinkUrl,
    isActive: q.isActive,
  }));

  return (
    <div>
      <PageHeader
        title="QR Codes"
        description="Every GS1 Digital Link QR Code generated for a product or lot."
      />
      <QrCodesTable rows={rows} />
    </div>
  );
}
