jest.mock("../../../src/api/services/adminInterviewSessions.service");

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useFetchAdminInterviewSessions,
  useFetchAdminInterviewSessionDetail,
} from "../../../src/api/hooks/useAdminInterviewSessions";
import {
  fetchAdminInterviewSessions,
  fetchAdminInterviewSessionDetail,
  type AdminSessionDetail,
  type AdminSessionSummary,
} from "../../../src/api/services/adminInterviewSessions.service";

const mockedFetchAdminInterviewSessions =
  fetchAdminInterviewSessions as jest.MockedFunction<typeof fetchAdminInterviewSessions>;
const mockedFetchAdminInterviewSessionDetail =
  fetchAdminInterviewSessionDetail as jest.MockedFunction<
    typeof fetchAdminInterviewSessionDetail
  >;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const candidate = {
  userId: "u1",
  email: "a@b.com",
  firstName: "A",
  lastName: "B",
};

const session = (id: string): AdminSessionSummary => ({
  id,
  candidate,
  interview: { id: "mi1", title: "Frontend Deep Dive", difficulty: "Medium" },
  status: "completed",
  startedAt: "2024-01-01T00:00:00Z",
  endedAt: "2024-01-01T00:30:00Z",
  durationMinutes: 30,
  videoStatus: "ready",
  hasCameraRecording: true,
  hasScreenRecording: false,
  totalQuestions: 5,
  answeredQuestions: 5,
  correctQuestions: 4,
  scorePercent: 80,
});

const detail = (id: string, videoStatus: AdminSessionDetail["recording"]["videoStatus"]): AdminSessionDetail => ({
  id,
  status: "completed",
  startedAt: "2024-01-01T00:00:00Z",
  endedAt: "2024-01-01T00:30:00Z",
  durationMinutes: 30,
  candidate,
  interview: { id: "mi1", title: "Frontend Deep Dive", difficulty: "Medium", durationMinutes: 30 },
  scoring: {
    totalQuestions: 5,
    answeredQuestions: 5,
    skippedQuestions: 0,
    correctQuestions: 4,
    scorePercent: 80,
    topicBreakdown: {},
  },
  recording: {
    videoStatus,
    videoUrl: videoStatus === "ready" ? "https://example.com/video.mp4" : null,
    screenVideoUrl: null,
    streams: [],
  },
  questions: [],
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useFetchAdminInterviewSessions", () => {
  test("registers ['admin-interview-sessions', search, status] normalizing undefined to ''", async () => {
    mockedFetchAdminInterviewSessions.mockResolvedValue({ sessions: [], totalLength: 0 });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchAdminInterviewSessions({}), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "admin-interview-sessions",
      "",
      "",
    ]);
  });

  test("embeds a given search and status in the query key", async () => {
    mockedFetchAdminInterviewSessions.mockResolvedValue({ sessions: [], totalLength: 0 });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useFetchAdminInterviewSessions({ search: "jane", status: "completed" }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "admin-interview-sessions",
      "jane",
      "completed",
    ]);
  });

  test("fetches page 1 first via fetchAdminInterviewSessions({ search, status, pageNumber })", async () => {
    mockedFetchAdminInterviewSessions.mockResolvedValue({ sessions: [], totalLength: 0 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useFetchAdminInterviewSessions({ search: "jane", status: "completed" }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedFetchAdminInterviewSessions).toHaveBeenCalledWith({
      search: "jane",
      status: "completed",
      pageNumber: 1,
    });
  });

  test("getNextPageParam requests another page while more sessions remain", async () => {
    mockedFetchAdminInterviewSessions.mockResolvedValueOnce({
      sessions: [session("s1"), session("s2")],
      totalLength: 3,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchAdminInterviewSessions({}), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    mockedFetchAdminInterviewSessions.mockResolvedValueOnce({
      sessions: [session("s3")],
      totalLength: 3,
    });

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages.length).toBe(2));

    expect(mockedFetchAdminInterviewSessions).toHaveBeenLastCalledWith({
      search: undefined,
      status: undefined,
      pageNumber: 2,
    });
    // 3 of 3 loaded now: exactly at the boundary, so no further page is offered.
    expect(result.current.hasNextPage).toBe(false);
  });

  test("getNextPageParam is undefined once every session has been loaded on page 1", async () => {
    mockedFetchAdminInterviewSessions.mockResolvedValue({
      sessions: [session("s1")],
      totalLength: 1,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchAdminInterviewSessions({}), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe("useFetchAdminInterviewSessionDetail", () => {
  test("registers ['admin-interview-session', id ?? ''] and calls fetchAdminInterviewSessionDetail(id)", async () => {
    mockedFetchAdminInterviewSessionDetail.mockResolvedValue(detail("s1", "ready"));
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchAdminInterviewSessionDetail("s1"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "admin-interview-session",
      "s1",
    ]);
    expect(mockedFetchAdminInterviewSessionDetail).toHaveBeenCalledWith("s1");
  });

  test("does not call the service when id is undefined (enabled: !!id)", () => {
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchAdminInterviewSessionDetail(undefined), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedFetchAdminInterviewSessionDetail).not.toHaveBeenCalled();
    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "admin-interview-session",
      "",
    ]);
  });

  test("keeps polling every 5s while the recording is still processing", async () => {
    jest.useFakeTimers();
    try {
      mockedFetchAdminInterviewSessionDetail.mockResolvedValueOnce(detail("s1", "processing"));
      const { Wrapper } = createWrapper();

      const { result } = renderHook(() => useFetchAdminInterviewSessionDetail("s1"), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await jest.advanceTimersByTimeAsync(0);
      });
      expect(result.current.data?.recording.videoStatus).toBe("processing");
      expect(mockedFetchAdminInterviewSessionDetail).toHaveBeenCalledTimes(1);

      mockedFetchAdminInterviewSessionDetail.mockResolvedValueOnce(detail("s1", "processing"));
      await act(async () => {
        await jest.advanceTimersByTimeAsync(5000);
      });
      expect(mockedFetchAdminInterviewSessionDetail).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  test.each(["ready", "failed"] as const)(
    "stops polling once the recording reaches a terminal videoStatus (%s)",
    async (terminalStatus) => {
      jest.useFakeTimers();
      try {
        mockedFetchAdminInterviewSessionDetail.mockResolvedValueOnce(
          detail("s1", terminalStatus)
        );
        const { Wrapper } = createWrapper();

        const { result } = renderHook(() => useFetchAdminInterviewSessionDetail("s1"), {
          wrapper: Wrapper,
        });

        await act(async () => {
          await jest.advanceTimersByTimeAsync(0);
        });
        expect(result.current.data?.recording.videoStatus).toBe(terminalStatus);
        expect(mockedFetchAdminInterviewSessionDetail).toHaveBeenCalledTimes(1);

        await act(async () => {
          await jest.advanceTimersByTimeAsync(20000);
        });
        // A terminal status makes refetchInterval return false, so no further call happens
        // no matter how much time passes.
        expect(mockedFetchAdminInterviewSessionDetail).toHaveBeenCalledTimes(1);
      } finally {
        jest.useRealTimers();
      }
    }
  );

  test("placeholderData keeps the previous session's data on screen while a new id is loading", async () => {
    let resolveSecond!: (value: AdminSessionDetail) => void;
    mockedFetchAdminInterviewSessionDetail
      .mockResolvedValueOnce(detail("s1", "ready"))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          })
      );

    const { Wrapper } = createWrapper();
    const { result, rerender } = renderHook(
      ({ id }) => useFetchAdminInterviewSessionDetail(id),
      { wrapper: Wrapper, initialProps: { id: "s1" } }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("s1");

    rerender({ id: "s2" });

    // While s2's fetch is still pending, the previous session's data remains visible.
    expect(result.current.data?.id).toBe("s1");
    expect(result.current.isPlaceholderData).toBe(true);

    resolveSecond(detail("s2", "ready"));
    await waitFor(() => expect(result.current.data?.id).toBe("s2"));
    expect(result.current.isPlaceholderData).toBe(false);
  });
});
