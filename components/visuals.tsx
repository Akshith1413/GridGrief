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

export function MapCanvas({ snapshot }: { snapshot: MapSnapshot }) {
  const width = 760;
  const height = 420;
  const bounds = mapBounds(snapshot);

  return (
    <div className="visual-shell">
      <svg className="visual-canvas" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tactical disaster map">
        <rect className="map-background" x="0" y="0" width={width} height={height} rx="24" />

        {snapshot.disasterZones.map((zone) => {
          const points = zone.points
            .map((point) => {
              const projected = projectMapPoint(point.lat, point.lon, bounds, width, height);
              return `${projected.x},${projected.y}`;
            })
            .join(" ");
          return <polygon key={zone.id} className="zone-polygon" points={points} />;
        })}

        {snapshot.heatmap.map((spot) => {
          const point = projectMapPoint(spot.lat, spot.lon, bounds, width, height);
          return (
            <g key={spot.locationId}>
              <circle className="heatmap-pulse" cx={point.x} cy={point.y} r={18 + spot.intensity * 6} />
              <circle className="heatmap-core" cx={point.x} cy={point.y} r={6 + spot.intensity} />
            </g>
          );
        })}

        {snapshot.persons.map((person) => {
          const trail = person.trail;
          const latest = trail.at(-1);
          if (!latest) {
            return null;
          }

          const point = projectMapPoint(latest.lat, latest.lon, bounds, width, height);
          return (
            <g key={person.id}>
              <path className="trail-line" d={buildTrailPath(trail, snapshot, width, height)} />
              <circle
                className={`person-pin-${confidenceTone(person.confidence)}`}
                cx={point.x}
                cy={point.y}
                r="9"
              />
              <text className="person-label" x={point.x + 12} y={point.y - 10}>
                {person.name}
              </text>
            </g>
          );
        })}

        {snapshot.shelters.map((location) => {
          const point = projectMapPoint(location.lat, location.lon, bounds, width, height);
          return (
            <g key={location.id}>
              <rect className="shelter-pin" x={point.x - 5} y={point.y - 5} width="10" height="10" rx="2" />
              <text className="map-label" x={point.x + 10} y={point.y + 16}>
                {location.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function GraphCanvas({ snapshot }: { snapshot: GraphSnapshot }) {
  const width = 760;
  const height = 420;
  const groups = {
    person: snapshot.nodes.filter((node) => node.type === "person"),
    event: snapshot.nodes.filter((node) => node.type === "event"),
    location: snapshot.nodes.filter((node) => node.type === "location"),
  };
  const positions = new Map<string, { x: number; y: number }>();

  (["person", "event", "location"] as const).forEach((type, columnIndex) => {
    const items = groups[type];
    items.forEach((node, rowIndex) => {
      const x = 120 + columnIndex * 260;
      const y = 70 + rowIndex * Math.min(76, Math.max(48, 300 / Math.max(items.length, 1)));
      positions.set(node.id, { x, y });
    });
  });

  return (
    <div className="visual-shell">
      <svg className="visual-canvas" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Knowledge graph">
        <rect className="graph-background" x="0" y="0" width={width} height={height} rx="24" />
        {snapshot.edges.map((edge) => {
          const source = positions.get(edge.source);
          const target = positions.get(edge.target);
          if (!source || !target) {
            return null;
          }

          return (
            <g key={edge.id}>
              <line className="graph-edge" x1={source.x} y1={source.y} x2={target.x} y2={target.y} />
              <text className="edge-label" x={(source.x + target.x) / 2 + 8} y={(source.y + target.y) / 2 - 6}>
                {edge.label}
              </text>
            </g>
          );
        })}

        {snapshot.nodes.map((node) => {
          const point = positions.get(node.id);
          if (!point) {
            return null;
          }

          return (
            <g key={node.id}>
              <circle className={`graph-node graph-node-${node.type}`} cx={point.x} cy={point.y} r="26" />
              <text className="node-title" x={point.x} y={point.y - 4} textAnchor="middle">
                {node.label}
              </text>
              {typeof node.confidence === "number" ? (
                <text className="node-subtitle" x={point.x} y={point.y + 16} textAnchor="middle">
                  {formatPercent(node.confidence)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
