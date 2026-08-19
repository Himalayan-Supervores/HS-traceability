import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/ui";
import { ProducerForm } from "@/components/admin/ProducerForm";
import { csvList, formatDate } from "@/lib/utils";

export default async function ProducerDetailPage({ params }: { params: { id: string } }) {
  const producer = await db.producer.findUnique({
    where: { id: params.id },
    include: {
      products: { orderBy: { createdAt: "desc" } },
      lots: { orderBy: { createdAt: "desc" }, take: 10, include: { product: true } },
    },
  });
  if (!producer) notFound();

  return (
    <div>
      <PageHeader
        title={producer.name}
        description={producer.farmName}
        action={
          <div className="flex items-center gap-3">
            <Link
              href={`/producer/${producer.id}`}
              target="_blank"
              className="btn-secondary"
            >
              <ExternalLink className="h-4 w-4" /> Public page
            </Link>
            <DeleteButton
              endpoint={`/api/producers/${producer.id}`}
              confirmLabel="Delete this producer? This is only possible if no product references it."
              redirectTo="/admin/producers"
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <ProducerForm
          initial={{
            id: producer.id,
            name: producer.name,
            farmName: producer.farmName,
            country: producer.country,
            province: producer.province ?? "",
            district: producer.district ?? "",
            municipality: producer.municipality ?? "",
            address: producer.address ?? "",
            contactName: producer.contactName ?? "",
            contactPhone: producer.contactPhone ?? "",
            email: producer.email ?? "",
            certifications: producer.certifications ?? "",
            photoUrl: producer.photoUrl ?? "",
            description: producer.description ?? "",
            isActive: producer.isActive,
            isPublic: producer.isPublic,
            gpsLat: producer.gpsLat?.toString() ?? "",
            gpsLng: producer.gpsLng?.toString() ?? "",
          }}
        />

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 font-display text-lg">Linked products ({producer.products.length})</h2>
            {producer.products.length === 0 ? (
              <p className="text-sm text-sage">No product linked yet.</p>
            ) : (
              <ul className="space-y-2">
                {producer.products.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="text-sm text-pine-700 hover:underline">
                      {p.name}
                    </Link>
                    <span className="ml-2 font-mono text-xs text-sage">{p.gtin}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-display text-lg">Recent lots</h2>
            {producer.lots.length === 0 ? (
              <p className="text-sm text-sage">No lot recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {producer.lots.map((l) => (
                  <li key={l.id} className="flex items-center justify-between">
                    <div>
                      <Link href={`/admin/lots/${l.id}`} className="text-sm text-pine-700 hover:underline">
                        {l.lotNumber}
                      </Link>
                      <p className="text-xs text-sage">{formatDate(l.createdAt)}</p>
                    </div>
                    <StatusBadge status={l.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {csvList(producer.certifications).length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 font-display text-lg">Certifications</h2>
              <div className="flex flex-wrap gap-2">
                {csvList(producer.certifications).map((c) => (
                  <span key={c} className="badge bg-pine-50 text-pine-700">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
