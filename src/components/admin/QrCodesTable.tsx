"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, Loader2 } from "lucide-react";

export type QrRow = {
  id: string;
  gtin: string;
  productId: string;
  productName: string;
  lotNumber: string | null;
  digitalLinkUrl: string;
  isActive: boolean;
};

export function QrCodesTable({ rows }: { rows: QrRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  const allSelected = rows.length > 0 && selected.size === rows.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function toggleActive(row: QrRow) {
    setBusyId(row.id);
    await fetch(`/api/qrcodes/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    setBusyId(null);
    router.refresh();
  }

  const printHref = useMemo(() => {
    const ids = Array.from(selected);
    return `/admin/qrcodes/print?ids=${ids.join(",")}`;
  }, [selected]);

  return (
    <div className="card overflow-x-auto">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-sm text-sage">{selected.size} selected</p>
        <a
          href={selected.size > 0 ? printHref : undefined}
          target="_blank"
          aria-disabled={selected.size === 0}
          className={`btn-secondary text-xs ${selected.size === 0 ? "pointer-events-none opacity-40" : ""}`}
        >
          <Printer className="h-3.5 w-3.5" /> Print selected
        </a>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-pine-50/60 text-left text-xs uppercase tracking-wide text-sage">
          <tr>
            <th className="w-10 px-4 py-3">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            </th>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">GTIN</th>
            <th className="px-4 py-3">Lot</th>
            <th className="px-4 py-3">Digital Link</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-pine-50/40">
              <td className="px-4 py-3">
                <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleOne(row.id)} />
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/products/${row.productId}`} className="text-ink hover:underline">
                  {row.productName}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-ink/80">{row.gtin}</td>
              <td className="px-4 py-3 font-mono text-xs text-ink/80">{row.lotNumber ?? "—"}</td>
              <td className="max-w-[240px] truncate px-4 py-3 font-mono text-xs text-ink/60">
                {row.digitalLinkUrl}
              </td>
              <td className="px-4 py-3">
                <span className={`badge ${row.isActive ? "bg-pine-50 text-pine-700" : "bg-black/5 text-ink/50"}`}>
                  {row.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => toggleActive(row)}
                  disabled={busyId === row.id}
                  className="text-xs text-pine-700 hover:underline disabled:opacity-50"
                >
                  {busyId === row.id ? <Loader2 className="inline h-3 w-3 animate-spin" /> : row.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-sage">
                No QR Codes generated yet. Generate one from a product or lot page.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
