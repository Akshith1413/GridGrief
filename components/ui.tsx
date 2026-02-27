import Link from "next/link";
import type { ReactNode } from "react";

import { confidenceTone, formatDateTime, formatPercent, formatShortTime, titleCase } from "@/lib/formatters";
import type {
  DashboardOverview,
  NotificationRecord,
  PersonRecord,
  RecommendedAction,
} from "@/lib/types";

interface PanelProps {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ kicker, title, description, action, children, className = "" }: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          {kicker ? <p className="panel-kicker">{kicker}</p> : null}
          <h2 className="panel-title">{title}</h2>
          {description ? <p className="panel-description">{description}</p> : null}
        </div>
        {action ? <div className="panel-action">{action}</div> : null}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function StatusPill({ label, tone }: { label: string; tone?: string }) {
  return <span className={`status-pill ${tone ? `status-pill-${tone}` : ""}`}>{label}</span>;
}

export function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="confidence-row">
      <div className="confidence-track">
        <div
          className={`confidence-fill confidence-fill-${confidenceTone(value)}`}
          style={{ width: `${Math.max(6, Math.round(value * 100))}%` }}
        />
      </div>
      <span className="confidence-value">{formatPercent(value)}</span>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: string;
}) {
  return (
    <div className={`metric-card ${tone ? `metric-card-${tone}` : ""}`}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-detail">{detail}</p>
    </div>
  );
}

export function EventTicker({ items }: { items: DashboardOverview["liveTicker"] }) {
  return (
    <div className="ticker">
      {items.slice(0, 8).map((item) => (
        <article key={item.id} className="ticker-item">
          <span className="ticker-meta">{titleCase(item.sourceType)}</span>
          <p>{item.message}</p>
          <span className="ticker-time">{formatShortTime(item.timestamp)}</span>
        </article>
      ))}
    </div>
  );
}

export function PersonListItem({ person }: { person: PersonRecord }) {
  return (
    <Link href={`/person/${person.id}`} className="person-row">
      <div className="person-row-main">
        <div>
          <h3>{person.canonicalName}</h3>
          <p>
            {person.ageEstimate ? `${person.ageEstimate} yrs` : "Age unknown"} | {titleCase(person.gender)}
          </p>
        </div>
        <StatusPill
          label={titleCase(person.status)}
          tone={person.status === "found" ? "positive" : person.conflictFlags.length ? "critical" : "warning"}
        />
      </div>
      <ConfidenceBar value={person.compositeConfidence} />
      <div className="person-row-footer">
        <span>{person.lastKnownLocation?.name ?? "Location pending"}</span>
        <span>{formatDateTime(person.updatedAt)}</span>
      </div>
    </Link>
  );
}
