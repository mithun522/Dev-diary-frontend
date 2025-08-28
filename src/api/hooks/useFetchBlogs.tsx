import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchBlogsByUser } from "../services/blogs.service";

export const useFetchBlogsByUser = () => {
  return useInfiniteQuery({
    queryKey: ["blogs"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchBlogsByUser(Number(pageParam));
      return {
        blogs: response.blogs,
        total: response.totalLength,
        page: pageParam,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.blogs).length;
      if (totalLoaded < lastPage.total) {
        return allPages.length + 1; // fetch next page
      }
      return undefined; // no more pages
    },
    initialPageParam: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
