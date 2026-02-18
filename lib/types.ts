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

export interface AlertRecord {
  id: string;
  personId: string;
  subscriptionId: string;
  channels: string[];
  reason: string;
  message: string;
  createdAt: string;
}

export interface CaseNoteRecord {
  id: string;
  personId: string | null;
  personName?: string | null;
  title: string;
  body: string;
  priority: string;
  actor: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  timestamp: string;
  personId?: string | null;
  reviewId?: string;
  scenarioId?: string | null;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  personId: string | null;
  personQuery: string;
  threshold: number;
  channels: string[];
  cooldownMinutes: number;
  lastAlertAt: string | null;
}

export interface ReviewProposal {
  id: string;
  pairKey: string;
  primaryPersonId: string;
  candidatePersonId: string;
  mergeConfidence: number;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  rationale: string;
  strategyBreakdown: {
    fuzzyName: number;
    descriptor: number;
    attributeCorrelation: number;
    graphNeighborhood: number;
  };
}

export interface EvidenceRecord {
  id: string;
  rawText: string;
  sourceType: string;
  sourceUrl: string;
  sourceTrustScore: number;
  timestamp: string;
  ingestedAt: string;
  nlpConfidence: number;
  reportId: string;
  locationId: string | null;
  locationName: string | null;
  personIds: string[];
  relationships: string[];
  location?: LocationRecord | null;
}

export interface ScenarioCatalogEntry {
  id: string;
  name: string;
  summary: string;
  recommendedQuery: string;
  reportCount: number;
}

export interface DashboardOverview {
  generatedAt: string;
  metrics: {
    totalReports: number;
    deduplicatedReports: number;
    personsTracked: number;
    highConfidenceMatches: number;
    activeConflicts: number;
    averageConfidence: number;
    reviewQueue: number;
    reportsPerMinute: number;
    activeAlerts: number;
  };
  liveTicker: Array<{
    id: string;
    message: string;
    sourceType: string;
    timestamp: string;
    reportId?: string;
    personId?: string;
  }>;
  persons: PersonRecord[];
  alerts: AlertRecord[];
  simulation: {
    active: boolean;
    scenarioId: string | null;
    startedAt: string | null;
    emitted: number;
    total: number;
    chaosMode: boolean;
    completionMessage: string;
  };
  scenarioCatalog: Record<string, ScenarioCatalogEntry>;
  serviceHealth: Record<string, string>;
  sourceMix: Array<{ type: string; count: number }>;
  architecture: string[];
}

export interface SearchResponse {
  query: string;
  locationHint: string | null;
  results: PersonRecord[];
  explanation: string;
}

export interface BulkSearchResponse {
  generatedAt: string;
  totalQueries: number;
  searches: Array<{
    id: string;
    query: string;
    topMatch: PersonRecord | null;
    candidates: PersonRecord[];
    explanation: string;
  }>;
}

export interface PersonDetailResponse {
  person: PersonRecord;
  evidence: EvidenceRecord[];
  movementTrail: MovementTrailPoint[];
  duplicates: ReviewProposal[];
  alerts: AlertRecord[];
  subscriptions: SubscriptionRecord[];
  caseNotes: CaseNoteRecord[];
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  confidence?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  confidence?: number;
}

export interface GraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
  reviewQueue: ReviewProposal[];
}
