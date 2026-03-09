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
