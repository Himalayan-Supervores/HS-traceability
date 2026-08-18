"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sprout,
  Users,
  Package,
  QrCode,
  Barcode,
  Waypoints,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/producers", label: "Producers", icon: Users },
  { href: "/admin/lots", label: "Lots", icon: Sprout },
  { href: "/admin/qrcodes", label: "QR Codes", icon: QrCode },
  { href: "/admin/barcodes/gs1", label: "GS1 Barcode", icon: Barcode },
  { href: "/admin/barcodes/gs1-128", label: "GS1-128", icon: Barcode },
  { href: "/admin/traceability", label: "Traceability", icon: Waypoints },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="no-print fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-pine-900 md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <img src="/logo.png" alt="Himalayan Supervores" className="h-10 w-auto" />
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition",
                active ? "bg-pine-700 text-white" : "text-pine-200 hover:bg-pine-700/60 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-pine-700 px-4 py-4">
        <p className="truncate text-xs text-pine-300">Signed in as</p>
        <p className="truncate text-sm text-white">{adminName}</p>
        <form action="/api/auth/logout" method="post">
          <LogoutButton />
        </form>
      </div>
    </aside>
  );
}

function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
      className="mt-2 text-xs text-marigold-400 hover:text-marigold-500 hover:underline"
    >
      Sign out
    </button>
  );
}
