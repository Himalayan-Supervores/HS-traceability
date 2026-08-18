import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, StatusBadge, RowDeleteButton } from "@/components/admin/ui";
import type { Prisma } from "@prisma/client";

export default async function ProducersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const q = searchParams.q?.trim();
  const status = searchParams.status;

  const where: Prisma.ProducerWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { farmName: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const producers = await db.producer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true, lots: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Producers"
        description="Farms and growers supplying Himalayan Supervores."
        action={
          <Link href="/admin/producers/new" className="btn-primary">
            <Plus className="h-4 w-4" /> New producer
          </Link>
        }
      />

      <form className="mb-4 flex flex-wrap gap-3" method="get">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by name, farm or district…"
            className="field-input pl-9"
          />
        </div>
        <select name="status" defaultValue={status ?? ""} className="field-input w-auto">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-pine-50/60 text-left text-xs uppercase tracking-wide text-sage">
            <tr>
              <th className="px-4 py-3">Producer</th>
              <th className="px-4 py-3">District</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Lots</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {producers.map((p) => (
              <tr key={p.id} className="hover:bg-pine-50/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/producers/${p.id}`} className="font-medium text-ink hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-sage">{p.farmName}</p>
                </td>
                <td className="px-4 py-3 text-ink/80">{p.district || "—"}</td>
                <td className="px-4 py-3 text-ink/80">{p._count.products}</td>
                <td className="px-4 py-3 text-ink/80">{p._count.lots}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.isActive ? "active" : "inactive"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <RowDeleteButton
                    endpoint={`/api/producers/${p.id}`}
                    confirmLabel={`Delete ${p.name}? Only possible if no product references it.`}
                  />
                </td>
              </tr>
            ))}
            {producers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sage">
                  No producers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
