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
