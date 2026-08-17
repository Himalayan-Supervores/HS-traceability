"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, QrCode as QrCodeIcon, Download, Printer, RefreshCw } from "lucide-react";

export type QrCodeSummary = {
  id: string;
  digitalLinkUrl: string;
  isActive: boolean;
  createdAt: string;
};

export function QrCodeCard({
  productId,
  lotId,
  initialQrCode,
}: {
  productId: string;
  lotId?: string | null;
  initialQrCode: QrCodeSummary | null;
}) {
  const router = useRouter();
  const [qrCode, setQrCode] = useState<QrCodeSummary | null>(initialQrCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgKey, setImgKey] = useState(0);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/qrcodes/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, lotId: lotId ?? null }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not generate the QR Code.");
      return;
    }
    const data = await res.json();
    setQrCode(data.qrCode);
    router.refresh();
  }

  if (!qrCode) {
    return (
      <div className="card p-5">
        <h2 className="mb-1 font-display text-lg">GS1 QR Code</h2>
        <p className="mb-4 text-sm text-sage">
          {lotId
            ? "Generate a QR Code scoped to this batch (GTIN + lot)."
            : "Generate a product-level QR Code (GTIN only)."}
        </p>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="button" onClick={generate} disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCodeIcon className="h-4 w-4" />}
          Generate GS1 QR Code
        </button>
      </div>
    );
  }

  const imageUrl = `/api/qrcodes/${qrCode.id}/image?format=png`;
  const svgUrl = `/api/qrcodes/${qrCode.id}/image?format=svg&v=${imgKey}`;

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg">GS1 QR Code</h2>
        {!qrCode.isActive && <span className="badge bg-black/5 text-ink/50">Inactive</span>}
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <img
          key={imgKey}
          src={`${imageUrl}&v=${imgKey}`}
          alt="GS1 Digital Link QR Code"
          className="h-40 w-40 rounded-md border border-line bg-white p-2"
        />
        <div className="flex-1 space-y-3">
          <div>
            <p className="label-eyebrow">Digital Link URL</p>
            <p className="break-all rounded-md bg-pine-50/60 px-3 py-2 font-mono text-xs text-ink">
              {qrCode.digitalLinkUrl}
            </p>
            <p className="mt-1 text-xs text-sage">
              This URL never needs to change — edit the product or lot instead of reprinting.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`${imageUrl}&v=${imgKey}`} download={`qr-${qrCode.id}.png`} className="btn-secondary text-xs">
              <Download className="h-3.5 w-3.5" /> PNG
            </a>
            <a href={svgUrl} download={`qr-${qrCode.id}.svg`} className="btn-secondary text-xs">
              <Download className="h-3.5 w-3.5" /> SVG
            </a>
            <a href={qrCode.digitalLinkUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
              Open public page
            </a>
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => setImgKey((k) => k + 1)}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate image
            </button>
            <a href={`/admin/qrcodes/print?ids=${qrCode.id}`} target="_blank" className="btn-secondary text-xs">
              <Printer className="h-3.5 w-3.5" /> Print
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
