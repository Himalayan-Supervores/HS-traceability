import QRCode from "qrcode";

/** Generates a PNG data URL (base64) for the given URL — used for on-screen preview and print. */
export async function generateQrPngDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: { dark: "#16221C", light: "#FFFFFF" },
  });
}

/** Generates raw SVG markup for the given URL — used for the "download SVG" button. */
export async function generateQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#16221C", light: "#FFFFFF" },
  });
}
