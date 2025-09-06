import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchDsaByUser, type fetchDsaProps } from "../services/dsa.service";

interface FetchDsaProps {
  search: string;
  difficulty: string;
}

export const useFetchDsaProblemByUser = ({
  search,
  difficulty,
}: FetchDsaProps) => {
  return useInfiniteQuery<fetchDsaProps, Error>({
    queryKey: ["dsa", search ?? "", difficulty ?? "NONE"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchDsaByUser(
        search,
        difficulty,
        Number(pageParam)
      );
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.dsa).length;

      return totalLoaded < lastPage.totalLength
        ? allPages.length + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
