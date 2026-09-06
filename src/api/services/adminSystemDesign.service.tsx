// Admin CRUD for system-design-service's cases + patterns.
//
// NOTE: unlike most other admin slices (adminUsers.service.tsx, catalog.service.tsx), the
// existing read-only System Design page (`src/pages/system-design/SystemDesign.tsx`) is entirely
// backed by static mock data (`src/data/systemDesignData.ts`) — it never calls SYSTEM_DESIGN_CASES
// / SCALABILITY_PATTERNS. There is no existing frontend fetch function or query key to reuse, so
// this file also owns the list fetches for the admin pages (in addition to create/update/delete),
// following the same AxiosInstance + typed-response pattern as catalog.service.tsx.
//
// `requirements` / `tradeoffs` / `resources` on a case are free-form JSONB on the backend (no
// fixed shape), so they're typed as `unknown` here — the admin UI edits them as raw JSON text.
import {
  SYSTEM_DESIGN_CASE_BY_ID,
  SYSTEM_DESIGN_CASES,
  SCALABILITY_PATTERN_BY_ID,
  SCALABILITY_PATTERNS,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";

export type SystemDesignCaseRecord = {
  id: string;
  title: string;
  summary?: string;
  problem?: string;
  techStack: string[];
  requirements?: unknown;
  diagram?: string;
  tradeoffs?: unknown;
  resources?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

export type CaseInput = {
  title: string;
  summary?: string;
  problem?: string;
  techStack?: string[];
  requirements?: unknown;
  diagram?: string;
  tradeoffs?: unknown;
  resources?: unknown;
};

export type ScalabilityPatternRecord = {
  id: string;
  name: string;
  description?: string;
  useCases: string[];
  benefits: string[];
  drawbacks?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type PatternInput = {
  name: string;
  description?: string;
  useCases?: string[];
  benefits?: string[];
  drawbacks?: string[];
};

// The GET endpoints predate this admin slice and their exact response envelope isn't documented
// here — normalize defensively in case the backend wraps the array (e.g. `{ cases: [...] }`)
// rather than returning it directly.
const normalizeList = <T,>(data: unknown, key: string): T[] => {
  if (Array.isArray(data)) return data as T[];
  const wrapped = data as Record<string, unknown> | null | undefined;
  if (wrapped && Array.isArray(wrapped[key])) return wrapped[key] as T[];
  return [];
};

export const fetchSystemDesignCases = async (): Promise<
  SystemDesignCaseRecord[]
> => {
  const response = await AxiosInstance.get(SYSTEM_DESIGN_CASES);
  return normalizeList<SystemDesignCaseRecord>(response.data, "cases");
};

export const createCase = async (
  payload: CaseInput
): Promise<SystemDesignCaseRecord> => {
  const response = await AxiosInstance.post(SYSTEM_DESIGN_CASES, payload);
  return response.data;
};

export const updateCase = async (
  id: string,
  payload: CaseInput
): Promise<SystemDesignCaseRecord> => {
  const response = await AxiosInstance.put(
    SYSTEM_DESIGN_CASE_BY_ID(id),
    payload
  );
  return response.data;
};

export const deleteCase = async (id: string): Promise<void> => {
  await AxiosInstance.delete(SYSTEM_DESIGN_CASE_BY_ID(id));
};

export const fetchScalabilityPatterns = async (): Promise<
  ScalabilityPatternRecord[]
> => {
  const response = await AxiosInstance.get(SCALABILITY_PATTERNS);
  return normalizeList<ScalabilityPatternRecord>(response.data, "patterns");
};

export const createPattern = async (
  payload: PatternInput
): Promise<ScalabilityPatternRecord> => {
  const response = await AxiosInstance.post(SCALABILITY_PATTERNS, payload);
  return response.data;
};

export const updatePattern = async (
  id: string,
  payload: PatternInput
): Promise<ScalabilityPatternRecord> => {
  const response = await AxiosInstance.put(
    SCALABILITY_PATTERN_BY_ID(id),
    payload
  );
  return response.data;
};

export const deletePattern = async (id: string): Promise<void> => {
  await AxiosInstance.delete(SCALABILITY_PATTERN_BY_ID(id));
};
