"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type LotEvent = {
  id: string;
  type: string;
  eventDate: string;
  location: string | null;
  note: string | null;
};

const EVENT_TYPES = [
  "Harvested",
  "Packed",
  "Quality checked",
  "Shipped",
  "Customs cleared",
  "Delivered",
];

export function LotEvents({ lotId, initialEvents }: { lotId: string; initialEvents: LotEvent[] }) {
  const [events, setEvents] = useState<LotEvent[]>(initialEvents);
  const [type, setType] = useState(EVENT_TYPES[0]);
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/lots/${lotId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, eventDate, location: location || null, note: note || null }),
    });
    setLoading(false);

    if (!res.ok) {
      setError("Could not add event");
      return;
    }

    const data = await res.json();
    setEvents((ev) => [...ev, data.event].sort((a, b) => a.eventDate.localeCompare(b.eventDate)));
    setEventDate("");
    setLocation("");
    setNote("");
  }

  async function handleDelete(eventId: string) {
    await fetch(`/api/lots/${lotId}/events/${eventId}`, { method: "DELETE" });
    setEvents((ev) => ev.filter((e) => e.id !== eventId));
  }

  return (
    <div className="card p-5">
      <p className="label-eyebrow mb-3">Traceability timeline</p>

      {events.length === 0 ? (
        <p className="mb-4 text-sm text-sage">No events recorded yet.</p>
      ) : (
        <ul className="mb-5 space-y-3">
          {events.map((ev) => (
            <li key={ev.id} className="flex items-start justify-between gap-3 border-l-2 border-pine-400 pl-3">
              <div>
                <p className="text-sm font-medium text-ink">{ev.type}</p>
                <p className="text-xs text-sage">
                  {formatDate(ev.eventDate)}
                  {ev.location ? ` — ${ev.location}` : ""}
                </p>
                {ev.note && <p className="mt-0.5 text-xs text-sage">{ev.note}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(ev.id)}
                className="text-sage hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="space-y-3 border-t border-line pt-4">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            type="date"
            required
            className="field-input"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        <input
          className="field-input"
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className="field-input"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add event
        </button>
      </form>
    </div>
  );
}