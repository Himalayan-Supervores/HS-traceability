import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function csvList(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Resolves the domain to use when building GS1 Digital Link URLs. */
export function resolveBaseDomain(settingsDomain?: string | null): string {
  if (settingsDomain && settingsDomain.trim().length > 0) return settingsDomain.trim();
  const fallback = process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";
  return fallback.replace(/^https?:\/\//, "");
}
