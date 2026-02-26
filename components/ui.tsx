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
