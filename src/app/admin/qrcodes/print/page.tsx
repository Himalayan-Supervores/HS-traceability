import { db } from "@/lib/db";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function PrintQrCodesPage({ searchParams }: { searchParams: { ids?: string } }) {
  const ids = (searchParams.ids ?? "").split(",").filter(Boolean);

  const qrCodes = await db.qrCode.findMany({
    where: { id: { in: ids } },
    include: { product: true, lot: true },
  });

  return (
    <div>
      <div className="no-print mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Print QR Codes</h1>
          <p className="text-sm text-sage">{qrCodes.length} code(s) selected — use your browser's print dialog.</p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3">
        {qrCodes.map((q) => (
          <div key={q.id} className="break-inside-avoid rounded-lg border border-line p-4 text-center">
            <img
              src={`/api/qrcodes/${q.id}/image?format=png`}
              alt={`QR code for ${q.product.name}`}
              className="mx-auto h-36 w-36"
            />
            <p className="mt-2 text-sm font-medium">{q.product.name}</p>
            {q.lot && <p className="font-mono text-xs text-sage">Lot {q.lot.lotNumber}</p>}
            <p className="font-mono text-[10px] text-sage">{q.gtin}</p>
          </div>
        ))}
        {qrCodes.length === 0 && (
          <p className="col-span-full py-10 text-center text-sage">No QR Code found for the given selection.</p>
        )}
      </div>
    </div>
  );
}
