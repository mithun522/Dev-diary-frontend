import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchAdminInterviewSessions,
  fetchAdminInterviewSessionDetail,
  type AdminSessionPage,
  type AdminSessionStatus,
} from "../services/adminInterviewSessions.service";

interface UseFetchAdminInterviewSessionsProps {
  search?: string;
  status?: AdminSessionStatus;
}

export const useFetchAdminInterviewSessions = ({
  search,
  status,
}: UseFetchAdminInterviewSessionsProps) => {
  return useInfiniteQuery<AdminSessionPage, Error>({
    queryKey: ["admin-interview-sessions", search ?? "", status ?? ""],
    queryFn: async ({ pageParam = 1 }) =>
      fetchAdminInterviewSessions({
        search,
        status,
        pageNumber: Number(pageParam),
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.sessions).length;
      return totalLoaded < lastPage.totalLength ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useFetchAdminInterviewSessionDetail = (id?: string) => {
  return useQuery({
    queryKey: ["admin-interview-session", id ?? ""],
    queryFn: () => fetchAdminInterviewSessionDetail(id as string),
    enabled: !!id,
    // The recording is stitched asynchronously after the candidate ends the session (no push
    // notification) — keep polling while it's still pending/recording/processing, same as the
    // candidate-facing results screen, so a reviewer opening a just-finished session sees the
    // video appear without a manual refresh.
    refetchInterval: (query) => {
      const status = query.state.data?.recording.videoStatus;
      return status === "ready" || status === "failed" ? false : 5000;
    },
  });
};
