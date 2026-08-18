"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

export type ProductOption = { id: string; name: string; gtin: string };
export type LotOption = { id: string; lotNumber: string; productId: string };

export function Gs1_128Generator({ products, lots }: { products: ProductOption[]; lots: LotOption[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [lotId, setLotId] = useState<string>("");

  const product = products.find((p) => p.id === productId);
  const productLots = useMemo(() => lots.filter((l) => l.productId === productId), [lots, productId]);

  function handleProductChange(id: string) {
    setProductId(id);
    setLotId("");
  }

  const params = new URLSearchParams({ productId, ...(lotId ? { lotId } : {}) });
  const pngUrl = productId ? `/api/barcodes/gs1-128?${params.toString()}&format=png` : null;
  const svgUrl = productId ? `/api/barcodes/gs1-128?${params.toString()}&format=svg` : null;

  return (
    <div className="space-y-6">
      <div className="card grid max-w-xl gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="field-label">Product</label>
          <select className="field-input" value={productId} onChange={(e) => handleProductChange(e.target.value)}>
            {products.length === 0 && <option value="">No product yet</option>}
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.gtin}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Lot (optional)</label>
          <select className="field-input" value={lotId} onChange={(e) => setLotId(e.target.value)}>
            <option value="">GTIN only, no batch</option>
            {productLots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.lotNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {product && pngUrl && svgUrl && (
        <div className="card flex flex-col items-center gap-4 p-8">
          <img
            src={pngUrl}
            alt={`GS1-128 barcode for ${product.name}`}
            className="max-w-full rounded-md border border-line bg-white p-4"
          />
          <p className="text-center text-xs text-sage">
            Encodes AI (01) GTIN{lotId && " + AI (10) batch/lot"} — and packing date / net weight when available on
            the selected lot.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <a href={pngUrl} download={`gs1-128-${product.gtin}.png`} className="btn-secondary text-xs">
              <Download className="h-3.5 w-3.5" /> PNG
            </a>
            <a href={svgUrl} download={`gs1-128-${product.gtin}.svg`} className="btn-secondary text-xs">
              <Download className="h-3.5 w-3.5" /> SVG
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
