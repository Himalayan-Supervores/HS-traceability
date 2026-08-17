"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/producers", label: "Producers" },
  { href: "/admin/lots", label: "Lots" },
  { href: "/admin/qrcodes", label: "QR Codes" },
  { href: "/admin/traceability", label: "Traceability" },
  { href: "/admin/settings", label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="no-print sticky top-0 z-20 border-b border-line bg-pine-900 md:hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-marigold-500">
          <Leaf className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-display text-base text-white">N-Agro</span>
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 pb-2">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                active ? "bg-marigold-500 text-white" : "bg-pine-700/60 text-pine-100"
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
