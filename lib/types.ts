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
