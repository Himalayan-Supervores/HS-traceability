import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const producers = await db.producer.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="New product" description="Create a sellable reference and assign it a GTIN." />
      <div className="max-w-2xl">
        <ProductForm producers={producers} />
      </div>
    </div>
  );
}
