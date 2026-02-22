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

export function useLiveResource<T>(path: string, options: LiveResourceOptions<T> = {}) {
  const [data, setData] = useState<T | null>(options.initialData ?? null);
  const [loading, setLoading] = useState(options.initialData ? false : true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const listen = options.listen ?? true;
  const authRole = options.authRole;

  const fetchResource = useCallback(async () => {
    try {
      const session = authRole ? await ensureDemoSession(authRole) : null;
      const next = await apiGet<T>(path, session?.accessToken);
      if (!mountedRef.current) {
        return;
      }

      startTransition(() => {
        setData(next);
        setError(null);
        setLoading(false);
      });
    } catch (resourceError) {
      if (!mountedRef.current) {
        return;
      }

      startTransition(() => {
        setError(resourceError instanceof Error ? resourceError.message : "Unknown error");
        setLoading(false);
      });
    }
  }, [authRole, path]);

  useEffect(() => {
    mountedRef.current = true;
    void fetchResource();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchResource]);

  useEffect(() => {
    if (!listen) {
      return;
    }

    const source = new EventSource(`${API_BASE_URL}/api/v1/events/stream`);
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (refreshTimeout) {
        return;
      }

      refreshTimeout = setTimeout(() => {
        refreshTimeout = null;
        void fetchResource();
      }, 400);
    };

    for (const eventName of LIVE_EVENTS) {
      source.addEventListener(eventName, scheduleRefresh);
    }

    source.onerror = () => {
      scheduleRefresh();
    };

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      source.close();
    };
  }, [fetchResource, listen]);

  return {
    data,
    loading,
    error,
    refresh: () => {
      void fetchResource();
    },
    setData: setData as Dispatch<SetStateAction<T | null>>,
  };
}
