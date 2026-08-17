import { PageHeader } from "@/components/admin/ui";
import { ProducerForm } from "@/components/admin/ProducerForm";

export default function NewProducerPage() {
  return (
    <div>
      <PageHeader title="New producer" description="Add a farm or grower to the directory." />
      <div className="max-w-2xl">
        <ProducerForm />
      </div>
    </div>
  );
}
