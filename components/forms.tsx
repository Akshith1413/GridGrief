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

export function ReportComposer({ onDone }: { onDone?: () => void }) {
  const [rawText, setRawText] = useState("");
  const [sourceType, setSourceType] = useState("manual");
  const [personName, setPersonName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("unknown");
  const [locationName, setLocationName] = useState("");
  const [descriptors, setDescriptors] = useState("");
  const [message, setMessage] = useState("Manual intake ready");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await apiPost("/api/v1/reports/form", {
        sourceType,
        rawText,
        metadata: {
          personName: personName || null,
          age: age ? Number(age) : null,
          gender,
          locationName: locationName || null,
          descriptors: descriptors
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean),
        },
      });
      startTransition(() => {
        setRawText("");
        setPersonName("");
        setAge("");
        setLocationName("");
        setDescriptors("");
        setMessage("Report ingested successfully");
      });
      onDone?.();
    } catch (error) {
      startTransition(() => {
        setMessage(error instanceof Error ? error.message : "Submission failed");
      });
    }
  }

  return (
    <form className="stack gap-sm" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field">
          <span>Source</span>
          <select className="input" value={sourceType} onChange={(event) => setSourceType(event.target.value)}>
            <option value="manual">Manual</option>
            <option value="social">Social</option>
            <option value="ngo">NGO</option>
            <option value="hospital">Hospital</option>
            <option value="sms">SMS</option>
          </select>
        </label>
        <label className="field">
          <span>Person Name</span>
          <input className="input" value={personName} onChange={(event) => setPersonName(event.target.value)} />
        </label>
        <label className="field">
          <span>Age</span>
          <input className="input" value={age} onChange={(event) => setAge(event.target.value)} />
        </label>
        <label className="field">
          <span>Gender</span>
          <select className="input" value={gender} onChange={(event) => setGender(event.target.value)}>
            <option value="unknown">Unknown</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>
      </div>
      <label className="field">
        <span>Location</span>
        <input className="input" value={locationName} onChange={(event) => setLocationName(event.target.value)} />
      </label>
      <label className="field">
        <span>Descriptors</span>
        <input
          className="input"
          value={descriptors}
          onChange={(event) => setDescriptors(event.target.value)}
          placeholder="blue sari, silver hair, diabetic"
        />
      </label>
      <label className="field">
        <span>Raw Report</span>
        <textarea
          className="input textarea"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder="Describe the sighting, hospital intake, shelter registration, or SMS-style report."
          required
        />
      </label>
      <div className="button-row">
        <button className="button" type="submit">
          Ingest Report
        </button>
        <p className="inline-note">{message}</p>
      </div>
    </form>
  );
}
