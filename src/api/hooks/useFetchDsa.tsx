import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchActivityHeatmap,
  fetchDsaByUser,
  fetchDsaProgress,
  type fetchDsaProps,
} from "../services/dsa.service";

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

export const useFetchDsaProgress = () => {
  return useQuery({
    queryKey: ["dsa"],
    queryFn: async () => {
      const response = await fetchDsaProgress();
      return response.data;
    },
    staleTime: 10 * 60 * 60,
    gcTime: 10 * 60 * 1000,
  });
};

// Caller's daily catalog + curriculum submission activity for the last year, server-computed -
// powers the Progress tab's activity heatmap. Invalidated by catalog/curriculum submit mutations
// (see useSubmitSolution / useSubmitCurriculumSolution) since either can add a day's activity.
export const useDsaActivityHeatmap = () => {
  return useQuery({
    queryKey: ["dsa", "activity-heatmap"],
    queryFn: fetchActivityHeatmap,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
