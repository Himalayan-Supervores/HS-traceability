"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-sage">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-5">
      <p className="label-eyebrow">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-pine-50 text-pine-700",
  inactive: "bg-black/5 text-ink/50",
  in_production: "bg-pine-50 text-pine-700",
  packed: "bg-marigold-50 text-marigold-600",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-black/5 text-ink/60",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  in_production: "In production",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("badge", STATUS_STYLES[status] ?? "bg-black/5 text-ink/60")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function DeleteButton({
  endpoint,
  confirmLabel,
  redirectTo,
}: {
  endpoint: string;
  confirmLabel: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(confirmLabel)) return;
    setLoading(true);
    setError(null);
    const res = await fetch(endpoint, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Delete failed");
      return;
    }
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={handleDelete} disabled={loading} className="btn-danger">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Delete
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
