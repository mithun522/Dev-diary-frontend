import { CATALOG, CATALOG_SUBMISSIONS } from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type {
  CatalogProblemDetail,
  CatalogProblemPage,
  Submission,
} from "../../data/catalogData";

export const fetchCatalogProblems = async (
  search: string = "",
  difficulty: string,
  pageParam: number
): Promise<CatalogProblemPage> => {
  const params = new URLSearchParams();

  if (search) params.append("searchString", search);
  if (difficulty) params.append("difficulty", difficulty);
  if (pageParam) params.append("pageNumber", String(pageParam));

  const queryString = params.toString();
  const url = queryString ? `${CATALOG}?${queryString}` : CATALOG;

  const response = await AxiosInstance.get(url);
  return response.data;
};

export const fetchCatalogProblemDetail = async (
  id: string
): Promise<CatalogProblemDetail> => {
  const response = await AxiosInstance.get(`${CATALOG}/${id}`);
  return response.data;
};

export const fetchSubmissions = async (id: string): Promise<Submission[]> => {
  const response = await AxiosInstance.get(CATALOG_SUBMISSIONS(id));
  return response.data;
};

export const submitSolution = async (
  id: string,
  sourceCode: string
): Promise<Submission> => {
  const response = await AxiosInstance.post(CATALOG_SUBMISSIONS(id), {
    sourceCode,
  });
  return response.data;
};
