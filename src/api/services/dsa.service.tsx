import { DSA_BY_USER } from "../../constants/Api";
import type { DSAProblem } from "../../data/dsaProblemsData";
import AxiosInstance from "../../utils/AxiosInstance";

export const fetchDsaByUser = async (
  search: string = "",
  difficulty: string
): Promise<DSAProblem[]> => {
  const response = await AxiosInstance.get(
    `${DSA_BY_USER}?searchString=${search}&difficulty=${difficulty}`
  );
  return response.data;
};
