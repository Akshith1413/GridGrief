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
