import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PublicShell, InfoRow } from "@/components/public/PublicShell";
import { csvList } from "@/lib/utils";
import { MapPin, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProducerPublicPage({ params }: { params: { id: string } }) {
  const [producer, settings] = await Promise.all([
    db.producer.findUnique({
      where: { id: params.id },
      include: { products: { where: { isActive: true }, orderBy: { name: "asc" } } },
    }),
    db.settings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
  ]);

  if (!producer || !producer.isActive || !producer.isPublic) notFound();

  const certifications = csvList(producer.certifications);
  const location = [producer.municipality, producer.district, producer.province].filter(Boolean).join(", ");

  return (
    <PublicShell companyName={settings.companyName}>
      <div className="p-6">
        {producer.photoUrl && (
          <img
            src={producer.photoUrl}
            alt={producer.name}
            className="mb-5 aspect-[4/3] w-full rounded-xl object-cover"
          />
        )}

        <p className="label-eyebrow">Producer</p>
        <h1 className="font-display text-3xl leading-tight text-ink">{producer.name}</h1>
        <p className="mt-0.5 font-display italic text-ink/60">{producer.farmName}</p>

        {location && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-sage">
            <MapPin className="h-4 w-4" /> {location}, {producer.country}
          </p>
        )}

        {producer.description && (
          <p className="mt-5 text-sm leading-relaxed text-ink/80">{producer.description}</p>
        )}

        {certifications.length > 0 && (
          <div className="mt-5">
            <p className="label-eyebrow mb-2">Certification</p>
            <div className="flex flex-wrap gap-2">
              {certifications.map((c) => (
                <span key={c} className="badge bg-pine-50 text-pine-700">
                  <ShieldCheck className="h-3 w-3" /> {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {producer.products.length > 0 && (
          <div className="mt-6">
            <p className="label-eyebrow mb-2">Products supplied</p>
            <ul className="space-y-1">
              {producer.products.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/01/${p.gtin}`}
                    className="block rounded-md border border-line px-3 py-2 text-sm hover:bg-pine-50/60"
                  >
                    {p.name}
                    {p.variety && <span className="text-sage"> — {p.variety}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
