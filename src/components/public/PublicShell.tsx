import Link from "next/link";
export function PublicShell({
  companyName,
  children,
}: {
  companyName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-pine-50">
      <div className="mx-auto max-w-md px-4 py-6 sm:max-w-lg sm:py-10">
        <header className="mb-6 flex flex-col items-center justify-center gap-1">
          <img src="/logo.png" alt={companyName} className="h-14 w-auto" />
          <p className="label-eyebrow text-sage">Traceability</p>
        </header>
        <div className="rounded-2xl bg-paper shadow-xl">{children}</div>
        <footer className="mt-6 text-center text-xs text-sage">
          <p>Powered by GS1 Digital Link — scan any {companyName} QR Code to verify origin.</p>
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