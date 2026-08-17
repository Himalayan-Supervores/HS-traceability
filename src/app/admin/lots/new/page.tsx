import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { LotForm } from "@/components/admin/LotForm";

export default async function NewLotPage({ searchParams }: { searchParams: { productId?: string } }) {
  const [products, producers] = await Promise.all([
    db.product.findMany({ orderBy: { name: "asc" } }),
    db.producer.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="New lot" description="Record a new traceable batch." />
      <div className="max-w-2xl">
        <LotForm
          products={products}
          producers={producers}
          initial={searchParams.productId ? { productId: searchParams.productId } : undefined}
        />
      </div>
    </div>
  );
}
