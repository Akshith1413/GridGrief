"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { API_BASE_URL, apiGet, ensureDemoSession } from "@/lib/api";
import { type DemoRole } from "@/lib/types";

const LIVE_EVENTS = [
  "bootstrap",
  "raw.report.received",
  "graph.person.updated",
  "graph.confidence.changed",
  "alert.created",
  "notification.inbox.updated",
  "simulation.tick",
  "simulation.completed",
  "review.queue.updated",
];

interface LiveResourceOptions<T> {
  authRole?: DemoRole;
  listen?: boolean;
  initialData?: T | null;
}
