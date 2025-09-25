import { DSA_BY_PROGRESS, DSA_BY_USER } from "../../constants/Api";
import type { DSAProblem } from "../../data/dsaProblemsData";
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
  const response = await AxiosInstance.get(
    `${DSA_BY_USER}?searchString=${search}&difficulty=${difficulty}&pageNumber=${pageParam}`
  );
  return response.data;
};

export const fetchDsaProgress = async () => {
  const response = await AxiosInstance.get(DSA_BY_PROGRESS);
  return response;
};
