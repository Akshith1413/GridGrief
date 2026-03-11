"use client";

import { startTransition, useCallback, useDeferredValue, useEffect, useState } from "react";

import { ReportComposer } from "@/components/forms";
import { EmptyState, ErrorPanel, LoadingPanel, Panel, PersonListItem, StatusPill } from "@/components/ui";
import { apiPost } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/formatters";
import type { BulkSearchResponse, SearchResponse } from "@/lib/types";
import { useLiveResource } from "@/lib/use-live-resource";

export function SearchScreen() {
  const seedResults = useLiveResource<SearchResponse>("/api/v1/persons");
  const [query, setQuery] = useState("Ramesh Chennai 45");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationName, setLocationName] = useState("");
  const [radiusKm, setRadiusKm] = useState("20");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkInput, setBulkInput] = useState("Ramesh Narayanan\nLakshmi Devi\nAisha Khan");
  const [bulkResults, setBulkResults] = useState<BulkSearchResponse | null>(null);
  const [bulkMessage, setBulkMessage] = useState("Bulk family search ready");
  const deferredQuery = useDeferredValue(query);

  const runSearch = useCallback(async () => {
    setSearching(true);
    try {
      const next = await apiPost<SearchResponse>("/api/v1/persons/search", {
        query: deferredQuery,
        status: statusFilter || undefined,
        locationName: locationName || undefined,
        radiusKm: radiusKm ? Number(radiusKm) : undefined,
      });
      startTransition(() => {
        setResults(next);
        setError(null);
        setSearching(false);
      });
    } catch (searchError) {
      startTransition(() => {
        setError(searchError instanceof Error ? searchError.message : "Search failed");
        setSearching(false);
      });
    }
  }, [deferredQuery, locationName, radiusKm, statusFilter]);

  async function runBulkSearch() {
    try {
      const next = await apiPost<BulkSearchResponse>("/api/v1/persons/bulk-search", {
        queries: bulkInput
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
        limit: 3,
      });
      startTransition(() => {
        setBulkResults(next);
        setBulkMessage(`Processed ${next.totalQueries} names through batch search`);
      });
    } catch (bulkError) {
      startTransition(() => {
        setBulkMessage(bulkError instanceof Error ? bulkError.message : "Bulk search failed");
      });
    }
  }

  useEffect(() => {
    if (!seedResults.data) {
      return;
    }

    if (!results) {
      setResults(seedResults.data);
    }
  }, [results, seedResults.data]);

  useEffect(() => {
    if (!deferredQuery.trim()) {
      return;
    }

    const timeout = setTimeout(() => {
      void runSearch();
    }, 350);

    return () => clearTimeout(timeout);
  }, [deferredQuery, runSearch]);

  if (seedResults.loading && !seedResults.data) {
    return <LoadingPanel label="Preparing search intelligence..." />;
  }

  if (seedResults.error && !seedResults.data) {
    return <ErrorPanel message={seedResults.error} />;
  }

  const payload = results ?? seedResults.data;
  if (!payload) {
    return <ErrorPanel message="Search payload missing." />;
  }
