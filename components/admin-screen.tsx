"use client";

import { startTransition, useState } from "react";

import { NotificationList, ErrorPanel, LoadingPanel, Panel, StatusPill } from "@/components/ui";
import { apiPost, ensureDemoSession } from "@/lib/api";
import { formatDateTime, formatPercent, titleCase } from "@/lib/formatters";
import type { AdminOverview } from "@/lib/types";
import { useLiveResource } from "@/lib/use-live-resource";

export function AdminScreen() {
  const admin = useLiveResource<AdminOverview>("/api/v1/admin/overview", {
    authRole: "admin",
  });
  const [message, setMessage] = useState("Review queue ready");

  async function resolveProposal(id: string, action: "merge" | "dismiss") {
    try {
      const session = await ensureDemoSession("admin");
      await apiPost(`/api/v1/review-queue/${id}/resolve`, { action }, session.accessToken);
      startTransition(() => {
        setMessage(`Proposal ${action}d`);
      });
      admin.refresh();
    } catch (error) {
      startTransition(() => {
        setMessage(error instanceof Error ? error.message : "Resolution failed");
      });
    }
  }

  if (admin.loading && !admin.data) {
    return <LoadingPanel label="Loading admin and review controls..." />;
  }

  if (admin.error || !admin.data) {
    return <ErrorPanel message={admin.error ?? "Admin overview unavailable."} />;
  }

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Admin & Review</p>
          <h1>Human-in-the-loop merge decisions, audit trails, notifications, and security posture.</h1>
        </div>
        <StatusPill label={message} tone="warning" />
      </section>

      <div className="split-grid">
        <Panel kicker="Service Health" title="Gateway and intelligence services" description="Backend-reported health for each service role in the documented architecture.">
          <div className="service-grid">
            {Object.entries(admin.data.serviceHealth).map(([service, status]) => (
              <div key={service} className="service-card">
                <p>{titleCase(service.replace(/([A-Z])/g, " $1"))}</p>
                <StatusPill label={titleCase(status)} tone={status === "healthy" ? "positive" : "warning"} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel kicker="Security Controls" title="Applied policy surface" description="The demo backend intentionally exposes the controls called out in the document.">
          <div className="stack">
            {admin.data.security.map((item) => (
              <div key={item} className="note-card">
                <p>{item}</p>
              </div>
            ))}
          </div>
        </Panel>
