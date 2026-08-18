import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { Gs1BarcodeGenerator } from "@/components/admin/Gs1BarcodeGenerator";

export default async function Gs1BarcodePage() {
  const products = await db.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="GS1 Barcode"
        description="The classic linear retail barcode (EAN-13) encoding a product's GTIN — what a point-of-sale scanner reads. Genuine case-level GTIN-14s render as ITF-14 instead, since EAN-13 can't carry 14 digits."
      />
      <Gs1BarcodeGenerator products={products.map((p) => ({ id: p.id, name: p.name, gtin: p.gtin }))} />
    </div>
  );
}
