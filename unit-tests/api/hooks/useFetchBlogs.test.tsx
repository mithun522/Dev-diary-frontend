jest.mock("../../../src/api/services/blogs.service");

import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFetchBlogs } from "../../../src/api/hooks/useFetchBlogs";
import {
  fetchBlogsByPublished,
  fetchBlogsByUser,
  fetchBlogsByDrafts,
  fetchAllBlogs,
} from "../../../src/api/services/blogs.service";
import type { KnowledgeBlog } from "../../../src/data/knowledgeData";

const mockedFetchBlogsByPublished = fetchBlogsByPublished as jest.MockedFunction<
  typeof fetchBlogsByPublished
>;
const mockedFetchBlogsByUser = fetchBlogsByUser as jest.MockedFunction<typeof fetchBlogsByUser>;
const mockedFetchBlogsByDrafts = fetchBlogsByDrafts as jest.MockedFunction<
  typeof fetchBlogsByDrafts
>;
const mockedFetchAllBlogs = fetchAllBlogs as jest.MockedFunction<typeof fetchAllBlogs>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const blog = (id: string): KnowledgeBlog => ({
  id,
  title: `Title ${id}`,
  summary: "summary",
  content: "content",
  tags: [],
  published: true,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  readTime: 5,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useFetchBlogs — queryKey", () => {
  test("registers ['blogs', type, search || \"\"]", async () => {
    mockedFetchAllBlogs.mockResolvedValue({ blogs: [], totalLength: 0 });
    const { queryClient, Wrapper } = createWrapper();

    renderHook(() => useFetchBlogs("all", "trees"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["blogs", "all", "trees"]);
    });
  });

  test("normalizes an empty search to '' in the queryKey", async () => {
    mockedFetchAllBlogs.mockResolvedValue({ blogs: [], totalLength: 0 });
    const { queryClient, Wrapper } = createWrapper();

    renderHook(() => useFetchBlogs("all", ""), { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["blogs", "all", ""]);
    });
  });
});

describe("useFetchBlogs — dispatches to the right service by type", () => {
  test("type 'myBlogs' calls fetchBlogsByUser and no other fetcher", async () => {
    mockedFetchBlogsByUser.mockResolvedValue({ blogs: [blog("b1")], totalLength: 1 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchBlogs("myBlogs", "react"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchBlogsByUser).toHaveBeenCalledWith(1, "react");
    expect(mockedFetchBlogsByPublished).not.toHaveBeenCalled();
    expect(mockedFetchBlogsByDrafts).not.toHaveBeenCalled();
    expect(mockedFetchAllBlogs).not.toHaveBeenCalled();
  });

  test("type 'published' calls fetchBlogsByPublished and no other fetcher", async () => {
    mockedFetchBlogsByPublished.mockResolvedValue({ blogs: [], totalLength: 0 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchBlogs("published", ""), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchBlogsByPublished).toHaveBeenCalledWith(1, "");
    expect(mockedFetchBlogsByUser).not.toHaveBeenCalled();
    expect(mockedFetchBlogsByDrafts).not.toHaveBeenCalled();
    expect(mockedFetchAllBlogs).not.toHaveBeenCalled();
  });

  test("type 'drafts' calls fetchBlogsByDrafts and no other fetcher", async () => {
    mockedFetchBlogsByDrafts.mockResolvedValue({ blogs: [], totalLength: 0 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchBlogs("drafts", ""), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchBlogsByDrafts).toHaveBeenCalledWith(1, "");
    expect(mockedFetchBlogsByUser).not.toHaveBeenCalled();
    expect(mockedFetchBlogsByPublished).not.toHaveBeenCalled();
    expect(mockedFetchAllBlogs).not.toHaveBeenCalled();
  });

  test("type 'all' calls fetchAllBlogs and no other fetcher", async () => {
    mockedFetchAllBlogs.mockResolvedValue({ blogs: [], totalLength: 0 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchBlogs("all", ""), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchAllBlogs).toHaveBeenCalledWith(1, "");
    expect(mockedFetchBlogsByUser).not.toHaveBeenCalled();
    expect(mockedFetchBlogsByPublished).not.toHaveBeenCalled();
    expect(mockedFetchBlogsByDrafts).not.toHaveBeenCalled();
  });
});

describe("useFetchBlogs — pagination boundary", () => {
  test("getNextPageParam returns the next page number while blogs remain", async () => {
    mockedFetchAllBlogs.mockResolvedValueOnce({ blogs: [blog("b1"), blog("b2")], totalLength: 3 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchBlogs("all", ""), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    mockedFetchAllBlogs.mockResolvedValueOnce({ blogs: [blog("b3")], totalLength: 3 });
    await act(async () => {
      await result.current.fetchNextPage();
    });
    expect(mockedFetchAllBlogs).toHaveBeenLastCalledWith(2, "");
  });

  test("getNextPageParam returns undefined at the exact boundary where every blog is loaded", async () => {
    mockedFetchAllBlogs.mockResolvedValueOnce({ blogs: [blog("b1"), blog("b2")], totalLength: 3 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchBlogs("all", ""), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    mockedFetchAllBlogs.mockResolvedValueOnce({ blogs: [blog("b3")], totalLength: 3 });
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });
});
