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
      </div>

      <div className="split-grid">
        <Panel kicker="Human Review Queue" title="Duplicate merge decisions" description="Approve or dismiss fuzzy identity matches from the review queue.">
          <div className="stack">
            {admin.data.reviewQueue.length ? (
              admin.data.reviewQueue.map((proposal) => (
                <div key={proposal.id} className="note-card">
                  <strong>{formatPercent(proposal.mergeConfidence)}</strong>
                  <p>{proposal.rationale}</p>
                  <span className="inline-note">
                    created {formatDateTime(proposal.createdAt)} | status {titleCase(proposal.status)}
                  </span>
                  {proposal.status === "pending" ? (
                    <div className="button-row">
                      <button className="button" type="button" onClick={() => void resolveProposal(proposal.id, "merge")}>
                        Merge
                      </button>
                      <button className="button button-ghost" type="button" onClick={() => void resolveProposal(proposal.id, "dismiss")}>
                        Dismiss
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No pending proposals</h3>
                <p>Kick off the earthquake scenario to exercise the duplicate-review flow.</p>
              </div>
            )}
          </div>
        </Panel>

        <Panel kicker="Audit Trail" title="Latest security and operator events" description="Authentication, review actions, resets, and report ingestion are all logged.">
          <div className="stack">
            {admin.data.auditLogs.map((log) => (
              <div key={log.id} className="note-card">
                <strong>{titleCase(log.type.replace(/[._]/g, " "))}</strong>
                <p>{log.detail ?? "No detail supplied"}</p>
                <span className="inline-note">
                  {log.actor ?? "system"} | {formatDateTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
