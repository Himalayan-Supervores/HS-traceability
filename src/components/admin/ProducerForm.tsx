"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export type ProducerFormValues = {
  id?: string;
  name: string;
  farmName: string;
  country: string;
  province: string;
  district: string;
  municipality: string;
  address: string;
  contactName: string;
  contactPhone: string;
  email: string;
  certifications: string;
  photoUrl: string;
  description: string;
  isActive: boolean;
  isPublic: boolean;
};

const EMPTY: ProducerFormValues = {
  name: "",
  farmName: "",
  country: "Nepal",
  province: "",
  district: "",
  municipality: "",
  address: "",
  contactName: "",
  contactPhone: "",
  email: "",
  certifications: "",
  photoUrl: "",
  description: "",
  isActive: true,
  isPublic: true,
};

export function ProducerForm({ initial }: { initial?: Partial<ProducerFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<ProducerFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial?.id);

  function set<K extends keyof ProducerFormValues>(key: K, val: ProducerFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isEdit ? `/api/producers/${initial!.id}` : "/api/producers";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Please check the form for errors.");
      return;
    }

    const data = await res.json();
    router.push(`/admin/producers/${data.producer.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Producer name" required>
          <input className="field-input" required value={values.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Farm / exploitation name" required>
          <input
            className="field-input"
            required
            value={values.farmName}
            onChange={(e) => set("farmName", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Country">
          <input className="field-input" value={values.country} onChange={(e) => set("country", e.target.value)} />
        </Field>
        <Field label="Province">
          <input className="field-input" value={values.province} onChange={(e) => set("province", e.target.value)} />
        </Field>
        <Field label="District">
          <input className="field-input" value={values.district} onChange={(e) => set("district", e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Municipality">
          <input
            className="field-input"
            value={values.municipality}
            onChange={(e) => set("municipality", e.target.value)}
          />
        </Field>
        <Field label="Address">
          <input className="field-input" value={values.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Contact name">
          <input
            className="field-input"
            value={values.contactName}
            onChange={(e) => set("contactName", e.target.value)}
          />
        </Field>
        <Field label="Contact phone">
          <input
            className="field-input"
            value={values.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className="field-input"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
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

      <Field label="Photo">
        <ImageUpload value={values.photoUrl} onChange={(url) => set("photoUrl", url)} />
      </Field>

      <Field label="Description">
        <textarea
          className="field-input min-h-24"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-line text-pine-700 focus:ring-pine-600"
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isPublic}
            onChange={(e) => set("isPublic", e.target.checked)}
            className="h-4 w-4 rounded border-line text-pine-700 focus:ring-pine-600"
          />
          Show on public producer page
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save changes" : "Save producer"}
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
