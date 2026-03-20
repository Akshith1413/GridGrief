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

      <div className="split-grid">
        <Panel kicker="Duplicate Detection" title="Merge proposals" description="Identity-service style outputs surfaced for review.">
          <div className="stack">
            {graph.data.reviewQueue.length ? (
              graph.data.reviewQueue.map((proposal) => (
                <div key={proposal.id} className="note-card">
                  <strong>{formatPercent(proposal.mergeConfidence)}</strong>
                  <p>{proposal.rationale}</p>
                  <span className="inline-note">
                    fuzzy {proposal.strategyBreakdown.fuzzyName} | neighborhood {proposal.strategyBreakdown.graphNeighborhood}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No pending duplicate proposals</h3>
                <p>Run the earthquake simulation to surface transliteration and alias merge candidates.</p>
              </div>
            )}
          </div>
        </Panel>
        <Panel kicker="Source Balance" title="Ingestion mix" description="The graph is only as rich as the upstream source diversity feeding it.">
          <div className="source-mix">
            {dashboard.data.sourceMix.map((source) => (
              <div key={source.type} className="source-chip">
                <span>{titleCase(source.type)}</span>
                <strong>{source.count}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
