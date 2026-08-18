"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export type ProductOption = { id: string; name: string; gtin: string };

export function Gs1BarcodeGenerator({ products }: { products: ProductOption[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const product = products.find((p) => p.id === productId);

  const pngUrl = productId ? `/api/barcodes/gs1?productId=${productId}&format=png` : null;
  const svgUrl = productId ? `/api/barcodes/gs1?productId=${productId}&format=svg` : null;

  return (
    <div className="space-y-6">
      <div className="card max-w-md p-5">
        <label className="field-label">Product</label>
        <select className="field-input" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {products.length === 0 && <option value="">No product yet</option>}
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.gtin}
            </option>
          ))}
        </select>
      </div>

      {product && pngUrl && svgUrl && (
        <div className="card flex flex-col items-center gap-4 p-8">
          <img
            src={pngUrl}
            alt={`GS1 barcode for ${product.name}`}
            className="max-w-full rounded-md border border-line bg-white p-4"
          />
          <p className="text-xs text-sage">GTIN {product.gtin}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <a href={pngUrl} download={`barcode-${product.gtin}.png`} className="btn-secondary text-xs">
              <Download className="h-3.5 w-3.5" /> PNG
            </a>
            <a href={svgUrl} download={`barcode-${product.gtin}.svg`} className="btn-secondary text-xs">
              <Download className="h-3.5 w-3.5" /> SVG
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
