import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader, StatCard, StatusBadge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const [productCount, producerCount, lotCount, qrCount, recentLots, recentProducts] = await Promise.all([
    db.product.count(),
    db.producer.count(),
    db.lot.count(),
    db.qrCode.count(),
    db.lot.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { product: true } }),
    db.product.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { producer: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your products, producers, batches and QR Codes."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Products" value={productCount} />
        <StatCard label="Producers" value={producerCount} />
        <StatCard label="Lots" value={lotCount} />
        <StatCard label="QR Codes" value={qrCount} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg">Latest lots</h2>
            <Link href="/admin/lots" className="flex items-center gap-1 text-xs text-pine-700 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentLots.length === 0 ? (
            <p className="text-sm text-sage">No lots yet. Create your first one from Lots &gt; New lot.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentLots.map((lot) => (
                <li key={lot.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <Link href={`/admin/lots/${lot.id}`} className="text-sm font-medium text-ink hover:underline">
                      {lot.lotNumber}
                    </Link>
                    <p className="text-xs text-sage">
                      {lot.product.name} · {formatDate(lot.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={lot.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg">Latest products</h2>
            <Link href="/admin/products" className="flex items-center gap-1 text-xs text-pine-700 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="text-sm text-sage">No products yet. Create your first one from Products &gt; New product.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-sm font-medium text-ink hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-sage">
                      {product.producer?.name ?? "No producer linked"} · GTIN {product.gtin}
                    </p>
                  </div>
                  <StatusBadge status={product.isActive ? "active" : "inactive"} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
