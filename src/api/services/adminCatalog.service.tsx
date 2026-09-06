import { CATALOG, CATALOG_BY_ID } from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type {
  CatalogProblem,
  CatalogProblemDetail,
  SampleTestCase,
} from "../../data/catalogData";

// Body shape for POST /catalog and PUT /catalog/{id} (backend's CatalogProblemInput) — reuses the
// existing CatalogProblem/SampleTestCase types rather than redefining the same fields, per the
// admin-panel plan's convention of reusing *Input schemas where one already exists.
export type CatalogProblemInputPayload = Pick<
  CatalogProblem,
  | "slug"
  | "title"
  | "difficulty"
  | "topics"
  | "description"
  | "functionName"
  | "paramNames"
  | "starterCode"
> & {
  // Backend's CatalogProblemInput names this field `testCases` (not `sampleTestCases` — that name
  // is only used on the read-side CatalogProblemDetail response).
  testCases: Array<
    Pick<SampleTestCase, "args" | "expected" | "isSample"> & { id?: string }
  >;
};

export const createCatalogProblem = async (
  payload: CatalogProblemInputPayload
): Promise<CatalogProblemDetail> => {
  const response = await AxiosInstance.post(CATALOG, payload);
  return response.data;
};

export const updateCatalogProblem = async (
  id: string,
  payload: CatalogProblemInputPayload
): Promise<CatalogProblemDetail> => {
  const response = await AxiosInstance.put(CATALOG_BY_ID(id), payload);
  return response.data;
};

export const deleteCatalogProblem = async (id: string): Promise<void> => {
  await AxiosInstance.delete(CATALOG_BY_ID(id));
};
