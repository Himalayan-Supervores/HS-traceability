export function LocationMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const delta = 0.05;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const linkUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`;

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-line">
      <iframe
        src={embedUrl}
        title={`Map showing ${label}`}
        className="h-48 w-full"
        loading="lazy"
      />
      <a href={linkUrl} target="_blank" rel="noreferrer" className="block bg-pine-50/60 px-3 py-1.5 text-center text-xs text-pine-700 hover:underline">
        Open in full map
      </a>
    </div>
  );
}
