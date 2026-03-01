import { confidenceTone, formatPercent } from "@/lib/formatters";
import type { GraphSnapshot, MapSnapshot, MovementTrailPoint } from "@/lib/types";

function projectMapPoint(
  lat: number,
  lon: number,
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
  width: number,
  height: number,
) {
  const x = ((lon - bounds.minLon) / Math.max(bounds.maxLon - bounds.minLon, 0.0001)) * width;
  const y = height - ((lat - bounds.minLat) / Math.max(bounds.maxLat - bounds.minLat, 0.0001)) * height;
  return { x, y };
}

function buildTrailPath(trail: MovementTrailPoint[], mapSnapshot: MapSnapshot, width: number, height: number) {
  const points = trail.map((point) => projectMapPoint(point.lat, point.lon, mapBounds(mapSnapshot), width, height));
  if (!points.length) {
    return "";
  }

  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function mapBounds(snapshot: MapSnapshot) {
  const latitudes = snapshot.locations.map((location) => location.lat);
  const longitudes = snapshot.locations.map((location) => location.lon);

  return {
    minLat: Math.min(...latitudes) - 0.02,
    maxLat: Math.max(...latitudes) + 0.02,
    minLon: Math.min(...longitudes) - 0.02,
    maxLon: Math.max(...longitudes) + 0.02,
  };
}
