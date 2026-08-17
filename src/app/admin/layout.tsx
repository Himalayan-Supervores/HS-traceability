import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { MobileNav } from "@/components/admin/MobileNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  // Belt-and-braces: middleware already redirects unauthenticated requests,
  // this guards direct server-side renders (e.g. during development).
  if (!admin) redirect("/login");

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar adminName={admin.name} />
      <MobileNav />
      <main className="md:ml-60">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
