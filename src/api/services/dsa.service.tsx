import { DSA_ACTIVITY_HEATMAP, DSA_BY_PROGRESS, DSA_BY_USER } from "../../constants/Api";
import type { DailyActivity, DSAProblem } from "../../data/dsaProblemsData";
import AxiosInstance from "../../utils/AxiosInstance";

export interface fetchDsaProps {
  dsa: DSAProblem[];
  totalLength: number;
}

export const fetchDsaByUser = async (
  search: string = "",
  difficulty: string,
  pageParam: number
): Promise<fetchDsaProps> => {
  const params = new URLSearchParams();

  if (search) params.append("searchString", search);
  if (difficulty) params.append("difficulty", difficulty);
  if (pageParam) params.append("pageNumber", String(pageParam));

  const queryString = params.toString();
  const url = queryString ? `${DSA_BY_USER}?${queryString}` : DSA_BY_USER;

  const response = await AxiosInstance.get(url);
  return response.data;
};

export const fetchDsaProgress = async () => {
  const response = await AxiosInstance.get(DSA_BY_PROGRESS);
  return response;
};

// Server-computed daily catalog + curriculum submission activity for the caller, last year -
// powers the Progress tab's activity heatmap.
export const fetchActivityHeatmap = async (): Promise<DailyActivity[]> => {
  const response = await AxiosInstance.get(DSA_ACTIVITY_HEATMAP);
  return response.data;
};
