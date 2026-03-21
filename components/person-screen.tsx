"use client";

import { startTransition, useState } from "react";

import { apiPost, ensureDemoSession } from "@/lib/api";
import { formatDateTime, formatPercent, titleCase } from "@/lib/formatters";
import type { PersonDetailResponse } from "@/lib/types";
import { useLiveResource } from "@/lib/use-live-resource";
import { ConfidenceBar, EmptyState, ErrorPanel, LoadingPanel, Panel, StatusPill } from "@/components/ui";

export function PersonScreen({ personId }: { personId: string }) {
  const detail = useLiveResource<PersonDetailResponse>(`/api/v1/persons/${personId}`);
  const [subscriptionMessage, setSubscriptionMessage] = useState("Create a family alert subscription");

  async function subscribe() {
    if (!detail.data) {
      return;
    }

    try {
      const session = await ensureDemoSession("family_member");
      await apiPost(
        "/api/v1/alerts/subscribe",
        {
          personId: detail.data.person.id,
          personQuery: detail.data.person.canonicalName,
          threshold: Math.max(detail.data.person.compositeConfidence - 0.1, 0.45),
          channels: ["in_app", "websocket", "email"],
          cooldownMinutes: 20,
        },
        session.accessToken,
      );
      startTransition(() => {
        setSubscriptionMessage("Family alert subscription created");
      });
    } catch (error) {
      startTransition(() => {
        setSubscriptionMessage(error instanceof Error ? error.message : "Subscription failed");
      });
    }
  }

  if (detail.loading && !detail.data) {
    return <LoadingPanel label="Loading person intelligence profile..." />;
  }

  if (detail.error || !detail.data) {
    return <ErrorPanel message={detail.error ?? "Person detail not found."} />;
  }

  const payload = detail.data;
  const person = payload.person;

  return (
    <div className="page-stack">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Person Profile</p>
          <h1>{person.canonicalName}</h1>
          <p className="hero-text">
            {person.ageEstimate ? `${person.ageEstimate} years old` : "Age unknown"} | {titleCase(person.gender)} | last seen at{" "}
            {person.lastKnownLocation?.name ?? "location pending"}
          </p>
          <div className="mini-stat-row">
            <StatusPill label={titleCase(person.status)} tone={person.status === "found" ? "positive" : "warning"} />
            {person.conflictFlags.length ? (
              <StatusPill label={`${person.conflictFlags.length} conflict flags`} tone="critical" />
            ) : null}
          </div>
        </div>
        <Panel kicker="Composite Confidence" title={formatPercent(person.compositeConfidence)} description={person.explanation.summary}>
          <ConfidenceBar value={person.compositeConfidence} />
          <p className="inline-note">{person.explanation.confidence_breakdown}</p>
          <div className="button-row">
            <button className="button" type="button" onClick={() => void subscribe()}>
              Subscribe For Alerts
            </button>
            <p className="inline-note">{subscriptionMessage}</p>
          </div>
        </Panel>
      </section>
