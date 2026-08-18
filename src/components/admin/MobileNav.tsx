"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/producers", label: "Producers" },
  { href: "/admin/lots", label: "Lots" },
  { href: "/admin/qrcodes", label: "QR Codes" },
  { href: "/admin/barcodes/gs1", label: "GS1 Barcode" },
  { href: "/admin/barcodes/gs1-128", label: "GS1-128" },
  { href: "/admin/traceability", label: "Traceability" },
  { href: "/admin/settings", label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="no-print sticky top-0 z-20 border-b border-line bg-pine-50 md:hidden">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <img src="/logo.png" alt="Himalayan Supervores" className="h-8 w-auto" />
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 pb-2">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                active ? "bg-marigold-500 text-white" : "bg-pine-100 text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}