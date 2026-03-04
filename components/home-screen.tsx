"use client";

import Link from "next/link";

import { ReportComposer, SimulationControls } from "@/components/forms";
import { GraphCanvas, MapCanvas } from "@/components/visuals";
import {
  ConfidenceBar,
  ErrorPanel,
  EventTicker,
  LoadingPanel,
  MetricCard,
  Panel,
  PersonListItem,
  StatusPill,
} from "@/components/ui";
import { formatNumber, formatPercent, titleCase } from "@/lib/formatters";
import type { DashboardOverview, GraphSnapshot, MapSnapshot } from "@/lib/types";
import { useLiveResource } from "@/lib/use-live-resource";

export function HomeScreen() {
  const dashboard = useLiveResource<DashboardOverview>("/api/v1/dashboard/overview");
  const map = useLiveResource<MapSnapshot>("/api/v1/map");
  const graph = useLiveResource<GraphSnapshot>("/api/v1/graph");

  if (dashboard.loading && !dashboard.data) {
    return <LoadingPanel label="Loading the GriefGrid++ crisis console..." />;
  }

  if (dashboard.error || !dashboard.data) {
    return <ErrorPanel message={dashboard.error ?? "Dashboard payload is unavailable."} />;
  }

  const data = dashboard.data;

  return (
    <div className="page-stack">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Probabilistic Crisis Intelligence Engine</p>
          <h1>Unify chaotic disaster reports into ranked, explainable reunification leads.</h1>
          <p className="hero-text">
            GriefGrid++ fuses NGO lists, hospital intakes, SMS-style edge sync, and social evidence into a live
            knowledge graph built for the first 72 hours.
          </p>
          <div className="button-row">
            <Link className="button" href="/search">
              Search Missing Persons
            </Link>
            <Link className="button button-ghost" href="/dashboard">
              Open Ops Dashboard
            </Link>
            <Link className="button button-ghost" href="/command-center">
              Open Command Center
            </Link>
          </div>
          <div className="mini-stat-row">
            <StatusPill label={`${data.metrics.highConfidenceMatches} high-confidence matches`} tone="positive" />
            <StatusPill label={`${data.metrics.activeConflicts} active conflicts`} tone="critical" />
            <StatusPill label={`${data.metrics.reportsPerMinute} live reports/hour`} tone="warning" />
          </div>
        </div>
        <Panel
          kicker="Live Pulse"
          title="Reunification priority board"
          description="Top tracked people, confidence shifts, and stream activity from the demo pipeline."
        >
          <div className="metric-grid">
            <MetricCard
              label="Reports"
              value={formatNumber(data.metrics.totalReports)}
              detail={`${data.metrics.deduplicatedReports} duplicates suppressed`}
            />
            <MetricCard
              label="Persons"
              value={formatNumber(data.metrics.personsTracked)}
              detail="Active graph profiles"
            />
            <MetricCard
              label="Avg Confidence"
              value={formatPercent(data.metrics.averageConfidence)}
              detail="Composite score across active profiles"
            />
            <MetricCard
              label="Matches"
              value={formatNumber(data.metrics.highConfidenceMatches)}
              detail="Crossed 75% confidence"
              tone="positive"
            />
          </div>
          <EventTicker items={data.liveTicker} />
        </Panel>
      </section>

      <div className="split-grid">
        <Panel
          kicker="Tactical Map"
          title="Movement trails and heat clusters"
          description="Shelters, hospitals, disaster boundary, and current person positions."
          action={<Link href="/map">Open full map</Link>}
        >
          {map.data ? <MapCanvas snapshot={map.data} /> : <LoadingPanel label="Rendering tactical map..." />}
        </Panel>
        <Panel
          kicker="Graph Intelligence"
          title="Evidence-to-person linkage"
          description="People, event records, and location nodes stitched into a live graph."
          action={<Link href="/graph">Open graph view</Link>}
        >
          {graph.data ? <GraphCanvas snapshot={graph.data} /> : <LoadingPanel label="Rendering graph..." />}
        </Panel>
      </div>

      <div className="split-grid">
        <Panel
          kicker="Simulation"
          title="Run the recruiter demo sequence"
          description="Launch scenarios from the documentation and watch the graph evolve in real time."
        >
          <SimulationControls scenarios={data.scenarioCatalog} onDone={dashboard.refresh} />
        </Panel>
        <Panel
          kicker="Manual Intake"
          title="Submit a new report"
          description="Use the same canonical form for eyewitness notes, hospital intake, or offline SMS sync."
        >
          <ReportComposer onDone={dashboard.refresh} />
        </Panel>
      </div>
