import { useQuery } from "@tanstack/react-query";
import type { DSAProblem } from "../../data/dsaProblemsData";
import { fetchDsaByUser } from "../services/dsa.service";

interface FetchDsaProps {
  search: string;
  difficulty: string;
}

export const useFetchDsaProblemByUser = ({
  search,
  difficulty,
}: FetchDsaProps) => {
  return useQuery<DSAProblem[], Error>({
    queryKey: ["dsa", search ?? "", difficulty ?? "NONE"],
    queryFn: () => fetchDsaByUser(search, difficulty),
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
