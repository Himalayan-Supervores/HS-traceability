import Link from "next/link";
import { Plus, Search, Upload, Download } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { ImportProductsButton } from "@/components/admin/ImportProductsButton";
import type { Prisma } from "@prisma/client";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; producerId?: string; status?: string };
}) {
  const q = searchParams.q?.trim();
  const category = searchParams.category?.trim();
  const producerId = searchParams.producerId?.trim();
  const status = searchParams.status;

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { gtin: { contains: q, mode: "insensitive" } },
      { variety: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (producerId) where.producerId = producerId;
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const [products, producers, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { producer: true, _count: { select: { lots: true, qrCodes: true } } },
    }),
    db.producer.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({ distinct: ["category"], select: { category: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Products"
        description="Sellable references, each mapped to one GTIN."
        action={
          <div className="flex flex-wrap gap-2">
            <a href="/api/export/products" className="btn-secondary">
              <Download className="h-4 w-4" /> Export CSV
            </a>
            <ImportProductsButton />
            <Link href="/admin/products/new" className="btn-primary">
              <Plus className="h-4 w-4" /> New product
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
            placeholder="Search by name, GTIN or variety…"
            className="field-input pl-9"
          />
        </div>
        <select name="category" defaultValue={category ?? ""} className="field-input w-auto">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>
        <select name="producerId" defaultValue={producerId ?? ""} className="field-input w-auto">
          <option value="">All producers</option>
          {producers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="field-input w-auto">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-pine-50/60 text-left text-xs uppercase tracking-wide text-sage">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">GTIN</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Producer</th>
              <th className="px-4 py-3">Lots</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-pine-50/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-ink hover:underline">
                    {p.name}
                  </Link>
                  {p.variety && <p className="text-xs text-sage">{p.variety}</p>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink/80">
                  {p.gtin}
                  {p.isDemoGtin && <span className="ml-1.5 badge bg-marigold-50 text-marigold-600">DEMO</span>}
                </td>
                <td className="px-4 py-3 text-ink/80">{p.category}</td>
                <td className="px-4 py-3 text-ink/80">{p.producer?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink/80">{p._count.lots}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.isActive ? "active" : "inactive"} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sage">
                  No products match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
