"use client";

import { NotificationList, ErrorPanel, LoadingPanel, MetricCard, Panel, ReadinessMeter, StatusPill } from "@/components/ui";
import { formatNumber, formatPercent, titleCase } from "@/lib/formatters";
import type { AnalyticsResponse, DashboardOverview } from "@/lib/types";
import { useLiveResource } from "@/lib/use-live-resource";

export function AnalyticsScreen() {
  const analytics = useLiveResource<AnalyticsResponse>("/api/v1/analytics");
  const dashboard = useLiveResource<DashboardOverview>("/api/v1/dashboard/overview");

  if ((analytics.loading && !analytics.data) || !dashboard.data) {
    return <LoadingPanel label="Loading analytics deck..." />;
  }

  if (analytics.error || !analytics.data) {
    return <ErrorPanel message={analytics.error ?? "Analytics data unavailable."} />;
  }

  const data = analytics.data;

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1>See confidence distribution, hotspot concentration, readiness posture, and evidence quality in one view.</h1>
        </div>
        <StatusPill label={`Updated ${new Date(data.generatedAt).toLocaleTimeString("en-IN")}`} tone="positive" />
      </section>

      <div className="metric-grid">
        <MetricCard label="High Confidence" value={formatNumber(data.confidenceBuckets.high)} detail="Profiles above 75%" tone="positive" />
        <MetricCard label="Medium Confidence" value={formatNumber(data.confidenceBuckets.medium)} detail="Profiles between 50% and 75%" tone="warning" />
        <MetricCard label="Low Confidence" value={formatNumber(data.confidenceBuckets.low)} detail="Profiles still needing stronger evidence" tone="critical" />
        <MetricCard label="Notes" value={formatNumber(data.noteCoverage.totalNotes)} detail="Case notes across the platform" />
        <MetricCard label="Persons With Notes" value={formatNumber(data.noteCoverage.personsWithNotes)} detail="Coverage of human operational memory" />
        <MetricCard label="Tracked Profiles" value={formatNumber(dashboard.data.metrics.personsTracked)} detail="Live profiles from the dashboard" />
      </div>

      <div className="split-grid">
        <Panel kicker="Status Mix" title="Person-state distribution" description="Current balance between found and still-missing profiles.">
          <div className="bar-chart">
            {data.statusBreakdown.map((entry) => (
              <div key={entry.status} className="bar-chart-row">
                <div className="bar-chart-head">
                  <span>{titleCase(entry.status)}</span>
                  <strong>{entry.count}</strong>
                </div>
                <div className="bar-chart-track">
                  <div className="bar-chart-fill" style={{ width: `${Math.max(12, entry.count * 30)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel kicker="Hotspots" title="Report concentration by location" description="Where evidence is currently piling up fastest.">
          <div className="stack gap-sm">
            {data.hotspotLeaderboard.map((spot) => (
              <div key={spot.locationId} className="leaderboard-item">
                <div>
                  <strong>{spot.locationName}</strong>
                  <p>{spot.count} linked reports</p>
                </div>
                <span className="leaderboard-value">{spot.count}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="split-grid">
        <Panel kicker="Readiness" title="Implementation posture" description="A compact view of how complete the platform feels in each subsystem.">
          <div className="stack gap-sm">
            {data.implementationReadiness.map((item) => (
              <ReadinessMeter key={item.label} label={item.label} score={item.score} detail={item.detail} />
            ))}
          </div>
        </Panel>

        <Panel kicker="Source Reliability" title="Configured evidence weights" description="The scoring model's current source trust assumptions.">
          <div className="stack gap-sm">
            {Object.entries(data.sourceWeights).map(([source, weight]) => (
              <div key={source} className="status-bar-card">
                <div className="person-row-main">
                  <span>{titleCase(source)}</span>
                  <span className="status-bar-value">{formatPercent(weight)}</span>
                </div>
                <div className="status-bar-track">
                  <div className="status-bar-fill status-bar-fill-warning" style={{ width: `${Math.round(weight * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
