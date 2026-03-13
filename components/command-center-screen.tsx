"use client";

import Link from "next/link";
import { startTransition, useState, type FormEvent } from "react";

import { SimulationControls } from "@/components/forms";
import {
  ActionCard,
  ErrorPanel,
  LoadingPanel,
  MetricCard,
  NotificationList,
  Panel,
  ReadinessMeter,
  StatusPill,
} from "@/components/ui";
import { apiPost, ensureDemoSession } from "@/lib/api";
import { formatDateTime, formatNumber, formatPercent, titleCase } from "@/lib/formatters";
import type { CommandCenterOverview } from "@/lib/types";
import { useLiveResource } from "@/lib/use-live-resource";

export function CommandCenterScreen() {
  const center = useLiveResource<CommandCenterOverview>("/api/v1/command-center", {
    authRole: "admin",
  });
  const [personId, setPersonId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("Case notes ready");

  async function submitCaseNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const session = await ensureDemoSession("admin");
      await apiPost(
        "/api/v1/case-notes",
        {
          personId: personId || null,
          title,
          body,
          priority,
        },
        session.accessToken,
      );
      startTransition(() => {
        setTitle("");
        setBody("");
        setPriority("medium");
        setMessage("Case note added to the responder timeline");
      });
      center.refresh();
    } catch (error) {
      startTransition(() => {
        setMessage(error instanceof Error ? error.message : "Unable to add note");
      });
    }
  }

  if (center.loading && !center.data) {
    return <LoadingPanel label="Warming up the command center..." />;
  }

  if (center.error || !center.data) {
    return <ErrorPanel message={center.error ?? "Command center data is unavailable."} />;
  }

  const data = center.data;
  const dashboard = data.dashboard;
  const analytics = data.analytics;
  const pendingReviews = data.reviewQueue.filter((proposal) => proposal.status === "pending");

  return (
    <div className="page-stack">
      <section className="hero-banner command-hero">
        <div className="hero-copy">
          <p className="eyebrow">Command Center</p>
          <h1>Run the crisis room with live signal, human judgment, and gorgeous operational context.</h1>
          <p className="hero-text">
            This upgraded surface combines the graph, alerting, duplicate review, casework notes, and tactical
            readiness into one cinematic operator view.
          </p>
          <div className="button-row">
            <Link className="button" href="/search">
              Open Search Intelligence
            </Link>
            <Link className="button button-ghost" href="/admin">
              Open Admin Controls
            </Link>
          </div>
          <div className="mini-stat-row">
            <StatusPill label={`${pendingReviews.length} pending reviews`} tone="warning" />
            <StatusPill label={`${dashboard.metrics.activeAlerts} active alerts`} tone="critical" />
            <StatusPill label={`${analytics.noteCoverage.totalNotes} responder notes`} tone="positive" />
          </div>
        </div>
        <div className="command-hero-stack">
          <div className="signal-badge">
            <span>Live Confidence</span>
            <strong>{formatPercent(dashboard.metrics.averageConfidence)}</strong>
          </div>
          <div className="signal-badge">
            <span>Tracked Profiles</span>
            <strong>{formatNumber(dashboard.metrics.personsTracked)}</strong>
          </div>
          <div className="signal-badge">
            <span>Reports Ingested</span>
            <strong>{formatNumber(dashboard.metrics.totalReports)}</strong>
          </div>
        </div>
      </section>
