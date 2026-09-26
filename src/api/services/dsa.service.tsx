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

// Server-computed daily catalog + curriculum submission activity for the caller - powers the
// Progress tab's activity heatmap. Omit `year` for the rolling trailing 365 days ending today
// (the default view); pass a calendar year (2000-2100) for a full Jan-Dec grid, including
// all-zero days after today for the current year - lets the UI offer a LeetCode-style year
// selector without the grid growing/reflowing as more of the year passes.
export const fetchActivityHeatmap = async (year?: number): Promise<DailyActivity[]> => {
  const url = year ? `${DSA_ACTIVITY_HEATMAP}?year=${year}` : DSA_ACTIVITY_HEATMAP;
  const response = await AxiosInstance.get(url);
  return response.data;
};
