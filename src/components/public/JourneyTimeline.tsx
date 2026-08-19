import { Sprout, Package, Truck, ShieldCheck, CheckCircle2, ClipboardCheck, Circle } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Event = {
  id: string;
  type: string;
  eventDate: string | Date;
  location: string | null;
};

const ICONS: Record<string, typeof Sprout> = {
  Harvested: Sprout,
  Packed: Package,
  "Quality checked": ClipboardCheck,
  Shipped: Truck,
  "Customs cleared": ShieldCheck,
  Delivered: CheckCircle2,
};

export function JourneyTimeline({ events }: { events: Event[] }) {
  if (events.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="label-eyebrow mb-4">Journey timeline</p>

      <div className="flex gap-0 overflow-x-auto pb-2 sm:gap-0">
        {events.map((ev, i) => {
          const Icon = ICONS[ev.type] ?? Circle;
          const isLast = i === events.length - 1;
          return (
            <div key={ev.id} className="flex min-w-[92px] flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    "bg-pine-700 text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {!isLast && <div className="h-0.5 flex-1 bg-pine-400" />}
              </div>
              <p className="mt-2 text-center text-xs font-medium text-ink">{ev.type}</p>
              <p className="text-center text-[11px] text-sage">{formatDate(ev.eventDate as string)}</p>
              {ev.location && <p className="text-center text-[10px] text-sage">{ev.location}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}