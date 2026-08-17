"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export type ProductOption = { id: string; name: string; gtin: string; producerId: string | null };
export type ProducerOption = { id: string; name: string };

export type LotFormValues = {
  id?: string;
  lotNumber: string;
  productId: string;
  producerId: string;
  harvestDate: string;
  packingDate: string;
  shippingDate: string;
  quantity: string;
  unit: string;
  destination: string;
  storageConditions: string;
  status: "in_production" | "packed" | "shipped" | "delivered";
};

const EMPTY: LotFormValues = {
  lotNumber: "",
  productId: "",
  producerId: "",
  harvestDate: "",
  packingDate: "",
  shippingDate: "",
  quantity: "",
  unit: "kg",
  destination: "",
  storageConditions: "",
  status: "in_production",
};

export function LotForm({
  initial,
  products,
  producers,
}: {
  initial?: Partial<LotFormValues>;
  products: ProductOption[];
  producers: ProducerOption[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<LotFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial?.id);

  function set<K extends keyof LotFormValues>(key: K, val: LotFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleProductChange(productId: string) {
    const product = products.find((p) => p.id === productId);
    setValues((v) => ({ ...v, productId, producerId: product?.producerId ?? v.producerId }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isEdit ? `/api/lots/${initial!.id}` : "/api/lots";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        producerId: values.producerId || null,
        harvestDate: values.harvestDate || null,
        packingDate: values.packingDate || null,
        shippingDate: values.shippingDate || null,
        quantity: values.quantity ? Number(values.quantity) : null,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Please check the form for errors.");
      return;
    }

    const data = await res.json();
    router.push(`/admin/lots/${data.lot.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lot number" required>
          <input
            className="field-input font-mono"
            required
            value={values.lotNumber}
            onChange={(e) => set("lotNumber", e.target.value)}
            placeholder="MNG26081601"
          />
        </Field>
        <Field label="Product" required>
          <select
            className="field-input"
            required
            value={values.productId}
            onChange={(e) => handleProductChange(e.target.value)}
          >
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.gtin}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Producer">
        <select className="field-input" value={values.producerId} onChange={(e) => set("producerId", e.target.value)}>
          <option value="">No producer linked</option>
          {producers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Harvest date">
          <input
            type="date"
            className="field-input"
            value={values.harvestDate}
            onChange={(e) => set("harvestDate", e.target.value)}
          />
        </Field>
        <Field label="Packing date">
          <input
            type="date"
            className="field-input"
            value={values.packingDate}
            onChange={(e) => set("packingDate", e.target.value)}
          />
        </Field>
        <Field label="Shipping date">
          <input
            type="date"
            className="field-input"
            value={values.shippingDate}
            onChange={(e) => set("shippingDate", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Quantity">
          <input
            type="number"
            step="0.01"
            className="field-input"
            value={values.quantity}
            onChange={(e) => set("quantity", e.target.value)}
          />
        </Field>
        <Field label="Unit">
          <input className="field-input" value={values.unit} onChange={(e) => set("unit", e.target.value)} />
        </Field>
        <Field label="Status">
          <select className="field-input" value={values.status} onChange={(e) => set("status", e.target.value as LotFormValues["status"]) }>
            <option value="in_production">In production</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </Field>
      </div>

      <Field label="Destination">
        <input
          className="field-input"
          value={values.destination}
          onChange={(e) => set("destination", e.target.value)}
          placeholder="Rotterdam, Netherlands"
        />
      </Field>

      <Field label="Storage conditions">
        <input
          className="field-input"
          value={values.storageConditions}
          onChange={(e) => set("storageConditions", e.target.value)}
          placeholder="Cold chain, 8–10°C, 85–90% humidity"
        />
      </Field>

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save changes" : "Create lot"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">
        {label} {required && <span className="text-marigold-600">*</span>}
      </label>
      {children}
    </div>
  );
}
