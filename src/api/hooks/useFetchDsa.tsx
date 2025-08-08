import { useQuery } from "@tanstack/react-query";
import type { DSAProblem } from "../../data/dsaProblemsData";
import { fetchDsaByUser } from "../services/dsa.service";

export const useFetchDsaProblemByUser = () => {
  return useQuery<DSAProblem[], Error>({
    queryKey: ["dsa"],
    queryFn: () => fetchDsaByUser(),
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
