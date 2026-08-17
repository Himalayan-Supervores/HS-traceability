"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

export function ImportProductsButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    const text = await file.text();
    const res = await fetch("/api/import/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: text }),
    });
    setLoading(false);
    e.target.value = "";
    if (!res.ok) {
      setResult("Import failed. Check the CSV headers (gtin, product, category…).");
      return;
    }
    const data = await res.json();
    setResult(`${data.created} created, ${data.skipped} skipped out of ${data.totalRows} rows.`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" className="btn-secondary" onClick={() => inputRef.current?.click()} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Import CSV
      </button>
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
      {result && <span className="text-xs text-sage">{result}</span>}
    </div>
  );
}
