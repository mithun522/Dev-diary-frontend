import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchDsaByUser,
  fetchDsaProgress,
  type fetchDsaProps,
} from "../services/dsa.service";
import { computeWeeklyActivity } from "../../utils/computeWeeklyActivity";

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

// The backend has no daily/weekly aggregate endpoint, so this pulls every one of the user's
// problems (unfiltered, all pages) and buckets them client-side. Query key is prefixed with
// "dsa" so add/edit/delete's `invalidateQueries({ queryKey: ["dsa"] })` naturally refreshes it too.
export const useFetchDsaWeeklyActivity = () => {
  return useQuery({
    queryKey: ["dsa", "weekly-activity"],
    queryFn: async () => {
      const firstPage = await fetchDsaByUser("", "", 1);
      let allProblems = firstPage.dsa;
      const pageSize = firstPage.dsa.length;

      if (pageSize > 0 && allProblems.length < firstPage.totalLength) {
        const totalPages = Math.ceil(firstPage.totalLength / pageSize);
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            fetchDsaByUser("", "", i + 2)
          )
        );
        allProblems = allProblems.concat(
          remainingPages.flatMap((page) => page.dsa)
        );
      }

      return computeWeeklyActivity(allProblems);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
