import Link from "next/link";
import { Leaf } from "lucide-react";

export function PublicShell({
  companyName,
  children,
}: {
  companyName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-pine-900">
      <div className="mx-auto max-w-md px-4 py-6 sm:max-w-lg sm:py-10">
        <header className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-marigold-500">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div className="text-center">
            <p className="font-display text-lg leading-none text-white">{companyName}</p>
            <p className="label-eyebrow text-pine-300">Traceability</p>
          </div>
        </header>

        <div className="rounded-2xl bg-paper shadow-xl">{children}</div>

        <footer className="mt-6 text-center text-xs text-pine-300">
          <p>Powered by GS1 Digital Link — scan any N-Agro QR Code to verify origin.</p>
        </footer>
      </div>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="py-2.5">
      <p className="label-eyebrow">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value}</p>
    </div>
  );
}

export function NotFoundCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="p-8 text-center">
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="mt-2 text-sm text-sage">{message}</p>
      <Link href="/" className="mt-4 inline-block text-sm text-pine-700 hover:underline">
        Back home
      </Link>
    </div>
  );
}
