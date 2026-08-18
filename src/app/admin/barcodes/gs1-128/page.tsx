import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { Gs1_128Generator } from "@/components/admin/Gs1_128Generator";

export default async function Gs1_128Page() {
  const [products, lots] = await Promise.all([
    db.product.findMany({ orderBy: { name: "asc" } }),
    db.lot.findMany({ orderBy: { lotNumber: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="GS1-128"
        description="A Code 128 logistics barcode for shipping cartons and pallets — carries the GTIN plus, when a batch is selected, the lot number, packing date and net weight. Used for warehouse/logistics scanning, not at the check-out counter."
      />
      <Gs1_128Generator
        products={products.map((p) => ({ id: p.id, name: p.name, gtin: p.gtin }))}
        lots={lots.map((l) => ({ id: l.id, lotNumber: l.lotNumber, productId: l.productId }))}
      />
    </div>
  );
}
