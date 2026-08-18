"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { computeGtinCheckDigit, cleanGtin } from "@/lib/gs1";
import { ImageUpload } from "@/components/admin/ImageUpload";

export type ProducerOption = { id: string; name: string; farmName: string };

export type ProductFormValues = {
  id?: string;
  gtin: string;
  isDemoGtin: boolean;
  sku: string;
  name: string;
  nameEn: string;
  category: string;
  variety: string;
  description: string;
  producerId: string;
  originCountry: string;
  originRegion: string;
  sellingUnit: string;
  weight: string;
  packagingType: string;
  certifications: string;
  photoUrl: string;
  isActive: boolean;
};

const EMPTY: ProductFormValues = {
  gtin: "",
  isDemoGtin: false,
  sku: "",
  name: "",
  nameEn: "",
  category: "",
  variety: "",
  description: "",
  producerId: "",
  originCountry: "Nepal",
  originRegion: "",
  sellingUnit: "",
  weight: "",
  packagingType: "",
  certifications: "",
  photoUrl: "",
  isActive: true,
};

function gtinHint(gtin: string): { valid: boolean; message: string } {
  const digits = cleanGtin(gtin);
  if (digits.length === 0) return { valid: false, message: "GTIN is required (8, 12, 13 or 14 digits)." };
  if (![8, 12, 13, 14].includes(digits.length)) {
    return { valid: false, message: `${digits.length} digits entered — GTIN must be 8, 12, 13 or 14 digits.` };
  }
  const body = digits.slice(0, -1);
  const expected = computeGtinCheckDigit(body);
  const actual = Number(digits[digits.length - 1]);
  if (expected !== actual) {
    return { valid: false, message: `Check digit looks wrong — expected ${expected}, got ${actual}.` };
  }
  return { valid: true, message: "Valid GTIN check digit." };
}

export function ProductForm({
  initial,
  producers,
}: {
  initial?: Partial<ProductFormValues>;
  producers: ProducerOption[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial?.id);
  const gtinCheck = gtinHint(values.gtin);

  function set<K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isEdit ? `/api/products/${initial!.id}` : "/api/products";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, producerId: values.producerId || null }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Please check the form for errors.");
      return;
    }

    const data = await res.json();
    router.push(`/admin/products/${data.product.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="GTIN" required hint={gtinCheck.message}>
          <input
            className={`field-input font-mono ${
              values.gtin ? (gtinCheck.valid ? "border-pine-400" : "border-red-300") : ""
            }`}
            required
            value={values.gtin}
            onChange={(e) => set("gtin", e.target.value)}
            placeholder="8901234567894"
          />
        </Field>
        <Field label="Internal SKU (optional)" hint="Your own warehouse code — never printed on the QR Code.">
          <input className="field-input" value={values.sku} onChange={(e) => set("sku", e.target.value)} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.isDemoGtin}
          onChange={(e) => set("isDemoGtin", e.target.checked)}
          className="h-4 w-4 rounded border-line text-pine-700 focus:ring-pine-600"
        />
        This is a demo/test GTIN, not one officially issued by GS1
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name" required>
          <input className="field-input" required value={values.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="English name">
          <input className="field-input" value={values.nameEn} onChange={(e) => set("nameEn", e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" required>
          <input
            className="field-input"
            required
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="Fruit, Vegetable, Mushroom…"
          />
        </Field>
        <Field label="Variety">
          <input className="field-input" value={values.variety} onChange={(e) => set("variety", e.target.value)} />
        </Field>
      </div>

      <Field label="Producer">
        <select
          className="field-input"
          value={values.producerId}
          onChange={(e) => set("producerId", e.target.value)}
        >
          <option value="">No producer linked</option>
          {producers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.farmName}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Origin country">
          <input
            className="field-input"
            value={values.originCountry}
            onChange={(e) => set("originCountry", e.target.value)}
          />
        </Field>
        <Field label="Origin region / district">
          <input
            className="field-input"
            value={values.originRegion}
            onChange={(e) => set("originRegion", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Packaging type">
          <input
            className="field-input"
            value={values.packagingType}
            onChange={(e) => set("packagingType", e.target.value)}
            placeholder="5 kg carton"
          />
        </Field>
        <Field label="Weight">
          <input className="field-input" value={values.weight} onChange={(e) => set("weight", e.target.value)} />
        </Field>
        <Field label="Selling unit">
          <input
            className="field-input"
            value={values.sellingUnit}
            onChange={(e) => set("sellingUnit", e.target.value)}
            placeholder="carton, crate, kg"
          />
        </Field>
      </div>

      <Field label="Certifications" hint="Comma-separated, e.g. GlobalG.A.P., Organic Nepal">
        <input
          className="field-input"
          value={values.certifications}
          onChange={(e) => set("certifications", e.target.value)}
        />
      </Field>

      <Field label="Photo URL">
        <input className="field-input" value={values.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} />
      </Field>

      <Field label="Description">
        <textarea
          className="field-input min-h-24"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
          className="h-4 w-4 rounded border-line text-pine-700 focus:ring-pine-600"
        />
        Active
      </label>

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save changes" : "Save product"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label">
        {label} {required && <span className="text-marigold-600">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-sage">{hint}</p>}
    </div>
  );
}
