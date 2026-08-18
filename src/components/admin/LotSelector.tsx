"use client";

export function LotSelector({
  lots,
  selectedLotId,
}: {
  lots: { id: string; lotNumber: string; product: { name: string } }[];
  selectedLotId?: string;
}) {
  return (
    <form method="get" className="mb-6 max-w-md">
      <label className="field-label">Select a lot</label>
      <select
        name="lotId"
        defaultValue={selectedLotId}
        className="field-input"
        onChange={(e) => e.currentTarget.form?.submit()}
      >
        {lots.map((l) => (
          <option key={l.id} value={l.id}>
            {l.lotNumber} — {l.product.name}
          </option>
        ))}
      </select>
    </form>
  );
}