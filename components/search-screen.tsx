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

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Search & Matching</p>
          <h1>Query by name, descriptors, location hints, or entire family lists to surface explainable candidates.</h1>
        </div>
        <StatusPill label={`${formatNumber(payload.results.length)} candidates`} tone="warning" />
      </section>

      <div className="split-grid">
        <Panel kicker="Search Query" title="Re-rank the graph" description="Use free-text plus optional radius and status constraints.">
          <div className="stack gap-sm">
            <label className="field">
              <span>Query</span>
              <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Status</span>
                <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="">Any</option>
                  <option value="missing">Missing</option>
                  <option value="found">Found</option>
                </select>
              </label>
              <label className="field">
                <span>Location Hint</span>
                <input className="input" value={locationName} onChange={(event) => setLocationName(event.target.value)} />
              </label>
              <label className="field">
                <span>Radius (km)</span>
                <input className="input" value={radiusKm} onChange={(event) => setRadiusKm(event.target.value)} />
              </label>
            </div>
            <div className="button-row">
              <button className="button" type="button" onClick={() => void runSearch()}>
                {searching ? "Searching..." : "Run Search"}
              </button>
              <p className="inline-note">{payload.explanation}</p>
            </div>
            {error ? <ErrorPanel title="Search issue" message={error} /> : null}
          </div>
        </Panel>

        <Panel kicker="New Intake" title="Add evidence while you search" description="Report submissions immediately re-enter the ranking pipeline.">
          <ReportComposer onDone={() => void runSearch()} />
        </Panel>
      </div>
