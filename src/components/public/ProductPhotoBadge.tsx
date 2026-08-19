import { MapPin } from "lucide-react";

interface ProductPhotoBadgeProps {
  photoUrl: string;
  productName: string;
  originRegion?: string | null;
  originCountry: string;
}

export function ProductPhotoBadge({
  photoUrl,
  productName,
  originRegion,
  originCountry,
}: ProductPhotoBadgeProps) {
  return (
    <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-xl">
      <img
        src={photoUrl}
        alt={productName}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-paper/95 px-3 py-1.5 shadow-card backdrop-blur-sm">
        <MapPin className="h-3.5 w-3.5 text-marigold-600" />
        <span className="text-xs font-medium text-pine-900">
          {originRegion ? `${originRegion}, ` : ""}
          {originCountry}
        </span>
      </div>
    </div>
  );
}