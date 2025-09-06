// useFetchBlogs.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchBlogsByPublished,
  fetchBlogsByUser,
  fetchBlogsByDrafts,
  fetchAllBlogs,
} from "../services/blogs.service";

type BlogType = "all" | "published" | "myBlogs" | "drafts";

export const useFetchBlogs = (type: BlogType, search: string) => {
  return useInfiniteQuery({
    queryKey: ["blogs", type, search || ""],
    queryFn: async ({ pageParam = 1 }) => {
      switch (type) {
        case "myBlogs":
          return await fetchBlogsByUser(pageParam, search);

        case "published":
          return await fetchBlogsByPublished(pageParam, search);

        case "drafts":
          return await fetchBlogsByDrafts(pageParam, search);

        case "all":
        default:
          return await fetchAllBlogs(pageParam, search);
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.blogs).length;
      return totalLoaded < lastPage.totalLength
        ? allPages.length + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
