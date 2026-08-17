import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const settings = await db.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <div>
      <PageHeader title="Settings" description="Company identity and the domain used for GS1 Digital Link URLs." />
      <SettingsForm
        initial={{
          companyName: settings.companyName,
          domain: settings.domain,
          country: settings.country,
          contactEmail: settings.contactEmail ?? "",
          contactPhone: settings.contactPhone ?? "",
          logoUrl: settings.logoUrl ?? "",
        }}
      />
    </div>
  );
}
