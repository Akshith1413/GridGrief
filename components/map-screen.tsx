"use client";

import { MapCanvas } from "@/components/visuals";
import { ErrorPanel, LoadingPanel, Panel, StatusPill } from "@/components/ui";
import { formatPercent } from "@/lib/formatters";
import type { DashboardOverview, MapSnapshot } from "@/lib/types";
import { useLiveResource } from "@/lib/use-live-resource";

export function MapScreen() {
  const map = useLiveResource<MapSnapshot>("/api/v1/map");
  const dashboard = useLiveResource<DashboardOverview>("/api/v1/dashboard/overview");

  if (map.loading && !map.data) {
    return <LoadingPanel label="Rendering tactical map..." />;
  }

  if (map.error || !map.data || !dashboard.data) {
    return <ErrorPanel message={map.error ?? "Map snapshot unavailable."} />;
  }

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Leaflet-Style Tactical View</p>
          <h1>Heat clusters, movement trails, shelter overlays, and disaster boundary in one surface.</h1>
        </div>
        <div className="mini-stat-row">
          <StatusPill label={`${map.data.heatmap.length} active hotspots`} tone="warning" />
          <StatusPill label={`${map.data.shelters.length} shelters + hospitals`} tone="positive" />
        </div>
      </section>

      <Panel kicker="Operations Map" title="Current disaster zone picture" description="A responsive tactical rendering of the backend location graph.">
        <MapCanvas snapshot={map.data} />
      </Panel>

      <div className="split-grid">
        <Panel kicker="Tracked Trails" title="Current movement inference" description="Each row is the latest person trail inferred from sighting timestamps.">
          <div className="stack">
            {map.data.persons.map((person) => (
              <div key={person.id} className="note-card">
                <strong>{person.name}</strong>
                <p>{person.trail.map((point) => point.locationName).join(" -> ") || "Awaiting enough location evidence"}</p>
                <span className="inline-note">{formatPercent(person.confidence)} confidence</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel kicker="Hotspot Density" title="Heatmap intensities" description="Where the most reports are accumulating right now.">
          <div className="stack">
            {map.data.heatmap.map((spot) => (
              <div key={spot.locationId} className="note-card">
                <strong>{spot.locationName}</strong>
                <p>{spot.intensity} linked reports</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
