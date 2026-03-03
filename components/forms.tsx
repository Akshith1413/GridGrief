"use client";

import { startTransition, useState, type FormEvent } from "react";

import { apiPost, ensureDemoSession } from "@/lib/api";
import type { ScenarioCatalogEntry } from "@/lib/types";

export function SimulationControls({
  scenarios,
  onDone,
}: {
  scenarios: Record<string, ScenarioCatalogEntry>;
  onDone?: () => void;
}) {
  const scenarioKeys = Object.keys(scenarios);
  const [selectedScenario, setSelectedScenario] = useState(scenarioKeys[0] ?? "urban_earthquake");
  const [chaosMode, setChaosMode] = useState(false);
  const [message, setMessage] = useState("Simulation idle");

  async function runAction(path: string, okMessage: string) {
    try {
      const session = await ensureDemoSession("admin");
      await apiPost(path, undefined, session.accessToken);
      startTransition(() => {
        setMessage(okMessage);
      });
      onDone?.();
    } catch (error) {
      startTransition(() => {
        setMessage(error instanceof Error ? error.message : "Action failed");
      });
    }
  }

  return (
    <div className="stack gap-sm">
      <div className="form-grid">
        <label className="field">
          <span>Scenario</span>
          <select
            className="input"
            value={selectedScenario}
            onChange={(event) => setSelectedScenario(event.target.value)}
          >
            {scenarioKeys.map((key) => (
              <option key={key} value={key}>
                {scenarios[key].name}
              </option>
            ))}
          </select>
        </label>
        <label className="field field-checkbox">
          <span>Chaos mode</span>
          <input
            type="checkbox"
            checked={chaosMode}
            onChange={(event) => setChaosMode(event.target.checked)}
          />
        </label>
      </div>
      <div className="button-row">
        <button
          className="button"
          type="button"
          onClick={() =>
            void runAction(
              `/api/v1/simulation/start?scenario=${selectedScenario}&chaos=${chaosMode}`,
              `Started ${scenarios[selectedScenario]?.name ?? "simulation"}`,
            )
          }
        >
          Start Simulation
        </button>
        <button
          className="button button-ghost"
          type="button"
          onClick={() => void runAction("/api/v1/simulation/stop", "Simulation stopped")}
        >
          Stop
        </button>
        <button
          className="button button-ghost"
          type="button"
          onClick={() => void runAction("/api/v1/demo/reset", "Demo state reset")}
        >
          Reset Demo
        </button>
      </div>
      <p className="inline-note">{message}</p>
    </div>
  );
}
