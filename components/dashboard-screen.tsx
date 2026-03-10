"use client";

import Link from "next/link";

import { ReportComposer, SimulationControls } from "@/components/forms";
import { MapCanvas } from "@/components/visuals";
import {
  ErrorPanel,
  EventTicker,
  LoadingPanel,
  MetricCard,
  Panel,
  PersonListItem,
  StatusPill,
} from "@/components/ui";
import { formatNumber, formatPercent, titleCase } from "@/lib/formatters";
import type { DashboardOverview, MapSnapshot } from "@/lib/types";
import { useLiveResource } from "@/lib/use-live-resource";

export function DashboardScreen() {
  const dashboard = useLiveResource<DashboardOverview>("/api/v1/dashboard/overview");
  const map = useLiveResource<MapSnapshot>("/api/v1/map");

  if (dashboard.loading && !dashboard.data) {
    return <LoadingPanel label="Booting the operations dashboard..." />;
  }

  if (dashboard.error || !dashboard.data) {
    return <ErrorPanel message={dashboard.error ?? "Dashboard data is unavailable."} />;
  }

  const data = dashboard.data;

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Responder Dashboard</p>
          <h1>Live throughput, ranked people, and simulation control in one console.</h1>
        </div>
        <div className="button-row">
          <Link className="button button-ghost" href="/search">
            Open Search
          </Link>
          <Link className="button button-ghost" href="/command-center">
            Open Command Center
          </Link>
          <Link className="button button-ghost" href="/admin">
            Open Admin
          </Link>
        </div>
      </section>

      <div className="metric-grid">
        <MetricCard label="Tracked Profiles" value={formatNumber(data.metrics.personsTracked)} detail="Active person nodes" />
        <MetricCard label="High Confidence" value={formatNumber(data.metrics.highConfidenceMatches)} detail="Past 75% threshold" tone="positive" />
        <MetricCard label="Conflicts" value={formatNumber(data.metrics.activeConflicts)} detail="Contradictory location records" tone="critical" />
        <MetricCard label="Avg Confidence" value={formatPercent(data.metrics.averageConfidence)} detail="Live composite score" />
        <MetricCard label="Review Queue" value={formatNumber(data.metrics.reviewQueue)} detail="Human merge decisions" tone="warning" />
        <MetricCard label="Active Alerts" value={formatNumber(data.metrics.activeAlerts)} detail="Subscriptions triggered" tone="warning" />
      </div>

      <div className="split-grid">
        <Panel kicker="Live Feed" title="Operations ticker" description="Every ingestion and scoring event flows through here.">
          <EventTicker items={data.liveTicker} />
        </Panel>
        <Panel kicker="Service Mesh" title="Microservice health" description="Current status of the demo orchestration layer.">
          <div className="service-grid">
            {Object.entries(data.serviceHealth).map(([service, status]) => (
              <div key={service} className="service-card">
                <p>{titleCase(service.replace(/([A-Z])/g, " $1"))}</p>
                <StatusPill label={titleCase(status)} tone={status === "healthy" ? "positive" : "warning"} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="split-grid">
        <Panel kicker="Map Board" title="Current shelter and hospital picture" description="Live trails and hotspot layering.">
          {map.data ? <MapCanvas snapshot={map.data} /> : <LoadingPanel label="Refreshing map board..." />}
        </Panel>
        <Panel kicker="Scenario Controls" title="Drive the demo" description="Start the documented scenarios and feed more evidence into the graph.">
          <SimulationControls scenarios={data.scenarioCatalog} onDone={dashboard.refresh} />
          <div className="source-mix">
            {data.sourceMix.map((source) => (
              <div key={source.type} className="source-chip">
                <span>{titleCase(source.type)}</span>
                <strong>{source.count}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="split-grid">
        <Panel kicker="Priority Queue" title="People to act on now" description="Profiles with location evidence, conflict flags, and explainability.">
          <div className="stack">
            {data.persons.map((person) => (
              <PersonListItem key={person.id} person={person} />
            ))}
          </div>
        </Panel>
        <Panel kicker="Manual Intake" title="Add fresh evidence" description="The same canonical event shape powers form submissions and edge sync.">
          <ReportComposer onDone={dashboard.refresh} />
        </Panel>
      </div>
    </div>
  );
}
