import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/require-admin";
import { generateQrPngDataUrl, generateQrSvg } from "@/lib/qrcode";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (isUnauthorized(admin)) return admin;

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") ?? "png").toLowerCase();

  const qrCode = await db.qrCode.findUnique({ where: { id: params.id } });
  if (!qrCode) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (format === "svg") {
    const svg = await generateQrSvg(qrCode.digitalLinkUrl);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `inline; filename="qr-${qrCode.gtin}.svg"`,
      },
    });
  }

  const dataUrl = await generateQrPngDataUrl(qrCode.digitalLinkUrl);
  const base64 = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="qr-${qrCode.gtin}.png"`,
    },
  });
}
