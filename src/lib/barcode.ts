import bwipjs from "bwip-js";
import { normalizeGtinTo14 } from "./gs1";

/**
 * ---------------------------------------------------------------------------
 * Two different linear (1D) barcodes are used in GS1 supply chains, on top
 * of the QR/GS1 Digital Link code already generated elsewhere in this app:
 *
 * - A **retail GS1 barcode** (EAN-13, or ITF-14 for case-level items) —
 *   the classic black-and-white striped barcode, encoding the GTIN alone.
 *   This is what a retailer's point-of-sale scanner reads.
 * - **GS1-128** — a Code 128 barcode carrying one or more GS1 Application
 *   Identifiers (GTIN, batch/lot, packing date...), used on shipping
 *   cartons and pallet labels for logistics/warehouse scanning, not at
 *   the check-out counter.
 *
 * Both are generated here with `bwip-js`, a pure-JavaScript barcode
 * renderer (no native binary, safe in any Node.js server environment).
 * ---------------------------------------------------------------------------
 */

export type Gs1BarcodeSymbology = "ean13" | "itf14";

/**
 * A GTIN normalized to 14 digits with a leading zero means the item was
 * originally an 8/12/13-digit GTIN — that renders correctly as a standard
 * EAN-13 retail barcode (stripping the one padding zero). A genuine
 * 14-digit GTIN (non-zero indicator digit, case/pallet level) uses ITF-14
 * instead — EAN-13 cannot encode 14 digits.
 */
export function chooseGs1Symbology(gtin14: string): Gs1BarcodeSymbology {
  return gtin14.startsWith("0") ? "ean13" : "itf14";
}

function gs1BarcodeOptions(gtin: string) {
  const gtin14 = normalizeGtinTo14(gtin);
  const symbology = chooseGs1Symbology(gtin14);
  const text = symbology === "ean13" ? gtin14.slice(1) : gtin14;
  return {
    symbology,
    opts: {
      bcid: symbology,
      text,
      scale: 3,
      height: symbology === "ean13" ? 18 : 15,
      includetext: true,
      textxalign: "center" as const,
    },
  };
}

export async function generateGs1BarcodePng(
  gtin: string
): Promise<{ buffer: Buffer; symbology: Gs1BarcodeSymbology }> {
  const { symbology, opts } = gs1BarcodeOptions(gtin);
  const buffer = await bwipjs.toBuffer(opts);
  return { buffer, symbology };
}

export function generateGs1BarcodeSvg(gtin: string): { svg: string; symbology: Gs1BarcodeSymbology } {
  const { symbology, opts } = gs1BarcodeOptions(gtin);
  const svg = bwipjs.toSVG(opts);
  return { svg, symbology };
}

// ---------------------------------------------------------------------------
// GS1-128
// ---------------------------------------------------------------------------

function formatYyMmDd(d: Date): string {
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

export type Gs1_128Options = {
  lotNumber?: string | null;
  /** AI 13 — Packaging date. */
  packingDate?: Date | null;
  /** AI 3103 — Net weight in kilograms (3 implied decimal places). */
  netWeightKg?: number | null;
};

/**
 * Builds the human-readable "(AI)value(AI)value" text bwip-js expects for
 * the `gs1-128` symbology — it parses this notation itself and inserts the
 * FNC1 separators a GS1-128 scanner requires between variable-length fields.
 */
export function buildGs1_128Text(gtin: string, options: Gs1_128Options = {}): string {
  const gtin14 = normalizeGtinTo14(gtin);
  let text = `(01)${gtin14}`;
  if (options.lotNumber && options.lotNumber.trim()) {
    text += `(10)${options.lotNumber.trim()}`;
  }
  if (options.packingDate) {
    text += `(13)${formatYyMmDd(options.packingDate)}`;
  }
  if (options.netWeightKg != null && Number.isFinite(options.netWeightKg)) {
    const value = Math.max(0, Math.round(options.netWeightKg * 1000));
    text += `(3103)${String(value).padStart(6, "0")}`;
  }
  return text;
}

function gs1_128Options(text: string) {
  return {
    bcid: "gs1-128" as const,
    text,
    scale: 3,
    height: 15,
    includetext: true,
    textxalign: "center" as const,
  };
}

export async function generateGs1_128Png(text: string): Promise<Buffer> {
  return bwipjs.toBuffer(gs1_128Options(text));
}

export function generateGs1_128Svg(text: string): string {
  return bwipjs.toSVG(gs1_128Options(text));
}
