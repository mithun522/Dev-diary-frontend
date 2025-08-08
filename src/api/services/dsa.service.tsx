import { DSA_BY_USER } from "../../constants/Api";
import type { DSAProblem } from "../../data/dsaProblemsData";
import AxiosInstance from "../../utils/AxiosInstance";

export const fetchDsaByUser = async (): Promise<DSAProblem[]> => {
  const response = await AxiosInstance.get(DSA_BY_USER);
  return response.data;
};
