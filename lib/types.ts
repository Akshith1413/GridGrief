export interface LocationRecord {
  id: string;
  name: string;
  aliases?: string[];
  lat: number;
  lon: number;
  locationType: string;
  disasterZone: boolean;
}

export interface MovementTrailPoint {
  eventId: string;
  timestamp: string;
  locationName: string;
  lat: number;
  lon: number;
  sourceType: string;
}

export interface ExplanationSource {
  type: string;
  weight: number;
  contribution: number;
  detail: string;
  timestamp: string;
}

export interface ExplanationRecord {
  summary: string;
  sources: ExplanationSource[];
  conflicts: string[];
  confidence_breakdown: string;
}

export interface ProvenanceRecord {
  reportId: string;
  sourceType: string;
  timestamp: string;
  locationName: string | null;
}

export interface PersonRecord {
  id: string;
  canonicalName: string;
  aliases: string[];
  ageEstimate: number | null;
  ageConfidence: number;
  gender: string;
  physicalDescriptors: string[];
  embedding: number[];
  compositeConfidence: number;
  status: string;
  conflictFlags: string[];
  createdAt: string;
  updatedAt: string;
  sourceIds: string[];
  eventIds: string[];
  lastKnownLocationId: string | null;
  explanation: ExplanationRecord;
  provenance: ProvenanceRecord[];
  mergedInto: string | null;
  lastKnownLocation?: LocationRecord | null;
  movementTrail?: MovementTrailPoint[];
  matchScore?: number;
}

