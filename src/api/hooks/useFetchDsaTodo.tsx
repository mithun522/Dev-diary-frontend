import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchDsaTodos } from "../services/dsaTodo.service";
import type { DsaTodo } from "../../data/dsaTodoData";

export const DSA_TODOS_QUERY_KEY = ["dsaTodos"];

export const useFetchDsaTodos = (): UseQueryResult<DsaTodo[], Error> => {
  return useQuery({
    queryKey: DSA_TODOS_QUERY_KEY,
    queryFn: fetchDsaTodos,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
