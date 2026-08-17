import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, StatusBadge, DeleteButton } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { QrCodeCard } from "@/components/admin/QrCodeCard";
import { formatDate } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, producers] = await Promise.all([
    db.product.findUnique({
      where: { id: params.id },
      include: {
        producer: true,
        lots: { orderBy: { createdAt: "desc" } },
        qrCodes: { where: { lotId: null, isActive: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    db.producer.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const qrCode = product.qrCodes[0]
    ? {
        id: product.qrCodes[0].id,
        digitalLinkUrl: product.qrCodes[0].digitalLinkUrl,
        isActive: product.qrCodes[0].isActive,
        createdAt: product.qrCodes[0].createdAt.toISOString(),
      }
    : null;

  return (
    <div>
      <PageHeader
        title={product.name}
        description={`GTIN ${product.gtin}${product.isDemoGtin ? " · demo GTIN" : ""}`}
        action={
          <DeleteButton
            endpoint={`/api/products/${product.id}`}
            confirmLabel="Delete this product? This is only possible once its lots are removed."
            redirectTo="/admin/products"
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <ProductForm
          producers={producers}
          initial={{
            id: product.id,
            gtin: product.gtin,
            isDemoGtin: product.isDemoGtin,
            sku: product.sku ?? "",
            name: product.name,
            nameEn: product.nameEn ?? "",
            category: product.category,
            variety: product.variety ?? "",
            description: product.description ?? "",
            producerId: product.producerId ?? "",
            originCountry: product.originCountry,
            originRegion: product.originRegion ?? "",
            sellingUnit: product.sellingUnit ?? "",
            weight: product.weight ?? "",
            packagingType: product.packagingType ?? "",
            certifications: product.certifications ?? "",
            photoUrl: product.photoUrl ?? "",
            isActive: product.isActive,
          }}
        />

        <div className="space-y-6">
          <QrCodeCard productId={product.id} initialQrCode={qrCode} />

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg">Lots ({product.lots.length})</h2>
              <Link
                href={`/admin/lots/new?productId=${product.id}`}
                className="flex items-center gap-1 text-xs text-pine-700 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> New lot
              </Link>
            </div>
            {product.lots.length === 0 ? (
              <p className="text-sm text-sage">No lot recorded yet for this product.</p>
            ) : (
              <ul className="space-y-2">
                {product.lots.map((lot) => (
                  <li key={lot.id} className="flex items-center justify-between">
                    <div>
                      <Link href={`/admin/lots/${lot.id}`} className="text-sm text-pine-700 hover:underline">
                        {lot.lotNumber}
                      </Link>
                      <p className="text-xs text-sage">{formatDate(lot.harvestDate)}</p>
                    </div>
                    <StatusBadge status={lot.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
