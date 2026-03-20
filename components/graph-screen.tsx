"use client";

import { SimulationControls } from "@/components/forms";
import { GraphCanvas } from "@/components/visuals";
import { ErrorPanel, LoadingPanel, Panel, StatusPill } from "@/components/ui";
import { formatPercent, titleCase } from "@/lib/formatters";
import type { DashboardOverview, GraphSnapshot } from "@/lib/types";
import { useLiveResource } from "@/lib/use-live-resource";

export function GraphScreen() {
  const graph = useLiveResource<GraphSnapshot>("/api/v1/graph");
  const dashboard = useLiveResource<DashboardOverview>("/api/v1/dashboard/overview");

  if (graph.loading && !graph.data) {
    return <LoadingPanel label="Rendering graph intelligence..." />;
  }

  if (graph.error || !graph.data || !dashboard.data) {
    return <ErrorPanel message={graph.error ?? "Graph snapshot unavailable."} />;
  }

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Graph Intelligence</p>
          <h1>Trace person, event, and location nodes as the evidence graph evolves live.</h1>
        </div>
        <StatusPill label={`${graph.data.reviewQueue.length} merge proposals`} tone="warning" />
      </section>

      <div className="split-grid">
        <Panel kicker="Live Graph" title="Knowledge graph canvas" description="People sit to the left, evidence in the center, and locations to the right.">
          <GraphCanvas snapshot={graph.data} />
        </Panel>
        <Panel kicker="Simulation Driver" title="Feed new graph edges" description="Start the documented scenarios to watch new nodes appear.">
          <SimulationControls scenarios={dashboard.data.scenarioCatalog} onDone={graph.refresh} />
        </Panel>
      </div>
