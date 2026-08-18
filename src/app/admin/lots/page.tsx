import Link from "next/link";
import { Plus, Search, Download } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, StatusBadge, RowDeleteButton } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export default async function LotsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; productId?: string };
}) {
  const q = searchParams.q?.trim();
  const status = searchParams.status;
  const productId = searchParams.productId;

  const where: Prisma.LotWhereInput = {};
  if (q) {
    where.OR = [
      { lotNumber: { contains: q, mode: "insensitive" } },
      { destination: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (productId) where.productId = productId;

  const [lots, products] = await Promise.all([
    db.lot.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { product: true, producer: true },
    }),
    db.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Lots"
        description="Traceable batches, each pointing to one product and (optionally) one producer."
        action={
          <div className="flex gap-2">
            <a href="/api/export/lots" className="btn-secondary">
              <Download className="h-4 w-4" /> Export CSV
            </a>
            <Link href="/admin/lots/new" className="btn-primary">
              <Plus className="h-4 w-4" /> New lot
            </Link>
          </div>
        }
      />

      <form className="mb-4 flex flex-wrap gap-3" method="get">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by lot number or destination…"
            className="field-input pl-9"
          />
        </div>
        <select name="productId" defaultValue={productId ?? ""} className="field-input w-auto">
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="field-input w-auto">
          <option value="">All statuses</option>
          <option value="in_production">In production</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pine-50/60 text-left text-xs uppercase tracking-wide text-sage">
            <tr>
              <th className="px-4 py-3">Lot</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Producer</th>
              <th className="px-4 py-3">Harvest</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lots.map((lot) => (
              <tr key={lot.id} className="hover:bg-pine-50/40">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/admin/lots/${lot.id}`} className="font-medium text-ink hover:underline">
                    {lot.lotNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink/80">{lot.product.name}</td>
                <td className="px-4 py-3 text-ink/80">{lot.producer?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink/80">{formatDate(lot.harvestDate)}</td>
                <td className="px-4 py-3 text-ink/80">{lot.destination ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={lot.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <RowDeleteButton
                    endpoint={`/api/lots/${lot.id}`}
                    confirmLabel={`Delete lot ${lot.lotNumber}? This also removes its QR Codes.`}
                  />
                </td>
              </tr>
            ))}
            {lots.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sage">
                  No lots match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
