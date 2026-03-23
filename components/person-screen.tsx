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

      <div className="split-grid">
        <Panel kicker="Explainability" title="Evidence breakdown" description="Every major source and contribution is exposed to responders and families.">
          <div className="stack">
            {person.explanation.sources.map((source) => (
              <div key={`${source.type}-${source.timestamp}`} className="note-card">
                <strong>{titleCase(source.type)}</strong>
                <p>{source.detail}</p>
                <span className="inline-note">
                  weight {source.weight} | contribution {source.contribution} | {formatDateTime(source.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel kicker="Conflicts & Alerts" title="Operational caveats" description="Contradictions are stored, not hidden, so confidence remains explainable.">
          <div className="stack">
            {person.conflictFlags.length ? (
              person.conflictFlags.map((flag) => (
                <div key={flag} className="note-card note-card-critical">
                  <p>{flag}</p>
                </div>
              ))
            ) : (
              <EmptyState title="No conflict flags" description="Current evidence is internally consistent." />
            )}
            {payload.alerts.map((alert) => (
              <div key={alert.id} className="note-card">
                <strong>{titleCase(alert.reason)}</strong>
                <p>{alert.message}</p>
                <span className="inline-note">{formatDateTime(alert.createdAt)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="split-grid">
        <Panel kicker="Movement Timeline" title="Chronological sightings" description="The temporal graph becomes a human-readable trail here.">
          <div className="stack">
            {payload.movementTrail.map((point) => (
              <div key={point.eventId} className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <strong>{point.locationName}</strong>
                  <p>{titleCase(point.sourceType)} evidence</p>
                  <span className="inline-note">{formatDateTime(point.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel kicker="Duplicate Review" title="Identity proposals" description="Fuzzy merges stay visible for human review when confidence is borderline.">
          <div className="stack">
            {payload.duplicates.length ? (
              payload.duplicates.map((proposal) => (
                <div key={proposal.id} className="note-card">
                  <strong>{formatPercent(proposal.mergeConfidence)}</strong>
                  <p>{proposal.rationale}</p>
                  <span className="inline-note">
                    fuzzy {proposal.strategyBreakdown.fuzzyName} | descriptors {proposal.strategyBreakdown.descriptor}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState title="No duplicate proposals" description="This profile is currently distinct in the graph." />
            )}
          </div>
        </Panel>
      </div>

      <Panel kicker="Casework Notes" title="Responder context layer" description="Human context is now attached directly to the profile for handoffs and follow-up.">
        <div className="stack">
          {payload.caseNotes.length ? (
            payload.caseNotes.map((note) => (
              <article key={note.id} className={`note-card note-card-${note.priority}`}>
                <div className="person-row-main">
                  <strong>{note.title}</strong>
                  <StatusPill label={titleCase(note.priority)} tone={note.priority === "high" ? "critical" : "warning"} />
                </div>
                <p>{note.body}</p>
                <span className="inline-note">
                  {note.actor} | {formatDateTime(note.createdAt)}
                </span>
              </article>
            ))
          ) : (
            <EmptyState title="No responder notes yet" description="Notes created in the command center will appear here." />
          )}
        </div>
      </Panel>

      <Panel kicker="Evidence Records" title="Source-by-source provenance" description="Every event stays accessible with source trust and location context.">
        <div className="stack">
          {payload.evidence.map((event) => (
            <article key={event.id} className="evidence-card">
              <div className="person-row-main">
                <div>
                  <h3>{titleCase(event.sourceType)} report</h3>
                  <p>{event.location?.name ?? "Location pending"}</p>
                </div>
                <StatusPill label={`${Math.round(event.sourceTrustScore * 100)} trust`} tone="warning" />
              </div>
              <p>{event.rawText}</p>
              <span className="inline-note">
                NLP confidence {formatPercent(event.nlpConfidence)} | {formatDateTime(event.timestamp)}
              </span>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
