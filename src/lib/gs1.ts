/**
 * ---------------------------------------------------------------------------
 * GS1 concepts used in this project — read this before touching GTIN logic.
 * ---------------------------------------------------------------------------
 *
 * GTIN (Global Trade Item Number)
 *   The GS1 number that identifies WHAT a trade item is — e.g. "Alphonso
 *   mango, 5 kg carton, packed by N-Agro" — the same way an ISBN identifies
 *   a book edition. A GTIN is only valid if it was assigned using a GS1
 *   Company Prefix that GS1 (via the national Member Organisation — GS1
 *   Nepal in this project's case) licensed to the company. This app never
 *   invents GTINs and presents them as real: every demo product created by
 *   `prisma/seed.ts` has `isDemoGtin = true` and is labelled "DEMO" in the
 *   UI. Before going live, replace the demo GTINs with GTINs actually
 *   issued to the company.
 *
 * SKU (Stock Keeping Unit)
 *   An internal reference code a company invents for its own warehouse,
 *   accounting or ERP system. It is free-form, means nothing outside the
 *   company, and can change without telling anyone. The `Product.sku`
 *   field in this project is exactly that — never printed on a GS1 QR
 *   Code and never confused with `Product.gtin` in the code below.
 *
 * GS1 QR Code
 *   A QR Code is just a barcode symbol (a container). A "GS1 QR Code" is a
 *   QR Code whose payload follows a GS1 data structure — in this project,
 *   a GS1 Digital Link URI. The symbol itself carries no meaning; the URI
 *   it encodes does.
 *
 * GS1 Digital Link
 *   A GS1 standard (see https://www.gs1.org/standards/gs1-digital-link)
 *   that expresses GS1 Application Identifiers (AIs) as a web URL, so the
 *   same QR Code that a scanner reads as structured GS1 data also opens
 *   directly in a phone's browser. Syntax used here:
 *
 *     https://{domain}/01/{GTIN}            -> product-level page
 *     https://{domain}/01/{GTIN}/10/{LOT}    -> product + specific batch
 *
 *   "01" and "10" are GS1 Application Identifiers (AIs), not arbitrary path
 *   segments:
 *     AI 01  GTIN               — fixed length, 14 numeric digits
 *     AI 10  BATCH/LOT NUMBER   — variable length, up to 20 characters
 *
 *   Because the destination page is looked up live from the database by
 *   GTIN (and optionally lot), the company can edit the product's name,
 *   photo, certification, or even its producer, and the QR Code printed
 *   on packaging keeps working — nothing about the code itself changes.
 *
 * Why the GTIN must be properly assigned
 *   GS1 identifiers are globally unique by construction: GS1 licenses a
 *   Company Prefix to one company only, and that company alone assigns
 *   the item references built on it. A self-invented number that merely
 *   *looks* like a GTIN can collide with a real one used by another
 *   company anywhere in the world, and GS1 Digital Link resolvers,
 *   retailer systems and customs platforms that check the GS1 Company
 *   Prefix database will treat it as invalid. This project validates the
 *   GTIN check digit (below) but that only proves the number is
 *   well-formed — it cannot prove the number was actually licensed to
 *   this company. That step happens outside this codebase, with GS1.
 * ---------------------------------------------------------------------------
 */

/**
 * Computes the GS1 mod-10 check digit for a GTIN with its check digit
 * removed (works for GTIN-8, GTIN-12, GTIN-13 and GTIN-14 payloads alike,
 * since the algorithm is defined by position counted from the right).
 *
 * Algorithm (GS1 General Specifications, "Check digit calculation"):
 * starting from the rightmost digit, multiply digits alternately by 3
 * then 1; sum them; the check digit is whatever, added to that sum,
 * reaches the next multiple of 10.
 */
export function computeGtinCheckDigit(digitsWithoutCheckDigit: string): number {
  const digits = digitsWithoutCheckDigit.split("").map(Number);
  let sum = 0;
  let multiplier = 3; // rightmost non-check digit is always weighted 3
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += digits[i] * multiplier;
    multiplier = multiplier === 3 ? 1 : 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/** Strips spaces/dashes so pasted GTINs (e.g. "8 901234 567894") still validate. */
export function cleanGtin(input: string): string {
  return input.replace(/[^0-9]/g, "");
}

/**
 * Structural validation only: correct length (8, 12, 13 or 14 digits) and
 * a correct check digit. Does NOT confirm the number was actually issued
 * by GS1 — see the module comment above.
 */
export function isValidGtinFormat(input: string): boolean {
  const digits = cleanGtin(input);
  if (![8, 12, 13, 14].includes(digits.length)) return false;
  const body = digits.slice(0, -1);
  const providedCheckDigit = Number(digits[digits.length - 1]);
  return computeGtinCheckDigit(body) === providedCheckDigit;
}

/**
 * GS1 Digital Link requires the GTIN path element to always be expressed
 * as 14 digits, left-padded with zeros (a GTIN-13 "890...894" becomes
 * "0890...894"). This is what turns a GTIN-8/12/13/14 into the canonical
 * form used in URLs.
 */
export function normalizeGtinTo14(input: string): string {
  const digits = cleanGtin(input);
  return digits.padStart(14, "0");
}

/** GS1 Application Identifiers referenced by this project (subset). */
export const GS1_APPLICATION_IDENTIFIERS = {
  "01": {
    title: "GTIN",
    description: "Global Trade Item Number — identifies the product reference.",
    format: "14 numeric digits, fixed length",
  },
  "10": {
    title: "BATCH/LOT NUMBER",
    description: "Identifies the specific production batch of that GTIN.",
    format: "up to 20 alphanumeric characters, variable length",
  },
} as const;

/**
 * Builds the canonical GS1 Digital Link URL for a product, optionally
 * scoped to one lot. `domain` should NOT include a protocol or trailing
 * slash (e.g. "trace.n-agro.com").
 */
export function buildDigitalLinkUrl(
  domain: string,
  gtin: string,
  lotNumber?: string | null
): string {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const gtin14 = normalizeGtinTo14(gtin);
  // GS1 Digital Link should always resolve over HTTPS in production. The one
  // exception is bare local development (localhost / 127.0.0.1), which has
  // no TLS certificate — falling back to http there just avoids a broken
  // "Open public page" link while testing; it never applies to a real domain.
  const isLocalDev = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanDomain);
  const protocol = isLocalDev ? "http" : "https";
  const base = `${protocol}://${cleanDomain}/01/${gtin14}`;
  if (lotNumber && lotNumber.trim().length > 0) {
    return `${base}/10/${encodeURIComponent(lotNumber.trim())}`;
  }
  return base;
}
