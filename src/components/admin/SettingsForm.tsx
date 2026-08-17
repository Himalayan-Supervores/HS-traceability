"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export type SettingsValues = {
  companyName: string;
  domain: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
};

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const [values, setValues] = useState<SettingsValues>(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SettingsValues>(key: K, val: SettingsValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not save settings.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl space-y-6 p-6">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div>
        <label className="field-label">Company name</label>
        <input className="field-input" value={values.companyName} onChange={(e) => set("companyName", e.target.value)} />
      </div>

      <div>
        <label className="field-label">Domain used for GS1 Digital Link URLs</label>
        <input
          className="field-input font-mono"
          value={values.domain}
          onChange={(e) => set("domain", e.target.value)}
          placeholder="trace.n-agro.com"
        />
        <p className="mt-1 text-xs text-sage">
          No protocol, no trailing slash. QR Codes will encode{" "}
          <span className="font-mono">https://{values.domain || "your-domain"}/01/&#123;GTIN&#125;</span>.
          Changing this only affects newly generated QR Codes — existing printed codes keep the old domain.
        </p>
      </div>

      <div>
        <label className="field-label">Country</label>
        <input className="field-input" value={values.country} onChange={(e) => set("country", e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Contact email</label>
          <input
            type="email"
            className="field-input"
            value={values.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Contact phone</label>
          <input
            className="field-input"
            value={values.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="field-label">Logo URL</label>
        <input className="field-input" value={values.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} />
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save settings
        </button>
        {saved && <span className="text-sm text-pine-700">Saved.</span>}
      </div>
    </form>
  );
}
