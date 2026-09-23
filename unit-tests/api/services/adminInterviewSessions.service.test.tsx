jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchAdminInterviewSessions,
  fetchAdminInterviewSessionDetail,
  type AdminSessionPage,
  type AdminSessionDetail,
  type AdminSessionStatus,
} from "../../../src/api/services/adminInterviewSessions.service";
import {
  ADMIN_INTERVIEW_SESSIONS,
  ADMIN_INTERVIEW_SESSION_BY_ID,
  INTERVIEW_SIMULATOR_API_URL,
} from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

const emptyPage: { data: AdminSessionPage } = {
  data: { sessions: [], totalLength: 0 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("admin-scoped endpoint paths", () => {
  test("ADMIN_INTERVIEW_SESSIONS lives under interview-simulator-service's /admin namespace", () => {
    expect(ADMIN_INTERVIEW_SESSIONS).toBe(
      `${INTERVIEW_SIMULATOR_API_URL}/admin/interview-sessions`
    );
  });

  test("ADMIN_INTERVIEW_SESSION_BY_ID interpolates the id under that same /admin namespace", () => {
    expect(ADMIN_INTERVIEW_SESSION_BY_ID("s1")).toBe(`${ADMIN_INTERVIEW_SESSIONS}/s1`);
  });
});

describe("fetchAdminInterviewSessions", () => {
  test("requests the bare /admin/interview-sessions URL when no filters or page are given", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminInterviewSessions({ pageNumber: 0 });
    expect(mockedAxios.get).toHaveBeenCalledWith(ADMIN_INTERVIEW_SESSIONS);
  });

  test("appends searchString when a search term is given", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminInterviewSessions({ search: "jane", pageNumber: 0 });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ADMIN_INTERVIEW_SESSIONS}?searchString=jane`
    );
  });

  test("omits searchString for an empty-string search (falsy)", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminInterviewSessions({ search: "", pageNumber: 0 });
    expect(mockedAxios.get).toHaveBeenCalledWith(ADMIN_INTERVIEW_SESSIONS);
  });

  test("appends status when given", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminInterviewSessions({ status: "completed", pageNumber: 0 });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ADMIN_INTERVIEW_SESSIONS}?status=completed`
    );
  });

  test.each(["in_progress", "completed", "abandoned"] as const)(
    "threads the %s status through to the query string",
    async (status: AdminSessionStatus) => {
      mockedAxios.get.mockResolvedValue(emptyPage);
      await fetchAdminInterviewSessions({ status, pageNumber: 0 });
      expect(mockedAxios.get).toHaveBeenCalledWith(`${ADMIN_INTERVIEW_SESSIONS}?status=${status}`);
    }
  );

  test("appends pageNumber when truthy", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminInterviewSessions({ pageNumber: 2 });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ADMIN_INTERVIEW_SESSIONS}?pageNumber=2`
    );
  });

  test("omits pageNumber for page 0 (falsy), so page 1 is implicit", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminInterviewSessions({ search: "jane", pageNumber: 0 });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ADMIN_INTERVIEW_SESSIONS}?searchString=jane`
    );
  });

  test("combines search, status and pageNumber in that order in a single query string", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminInterviewSessions({ search: "jane", status: "abandoned", pageNumber: 3 });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ADMIN_INTERVIEW_SESSIONS}?searchString=jane&status=abandoned&pageNumber=3`
    );
  });

  test("URL-encodes special characters in the search term", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminInterviewSessions({ search: "a@b.com test&x", pageNumber: 0 });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ADMIN_INTERVIEW_SESSIONS}?searchString=a%40b.com+test%26x`
    );
  });

  test("returns the AdminSessionPage body unchanged", async () => {
    const page: AdminSessionPage = {
      sessions: [
        {
          id: "s1",
          candidate: { userId: "u1", email: "a@b.com", firstName: "A", lastName: "B" },
          interview: { id: "m1", title: "System Design", difficulty: "Medium" },
          status: "completed",
          startedAt: "2024-01-01T00:00:00Z",
          endedAt: "2024-01-01T01:00:00Z",
          durationMinutes: 60,
          videoStatus: "ready",
          hasCameraRecording: true,
          hasScreenRecording: true,
          totalQuestions: 5,
          answeredQuestions: 5,
          correctQuestions: 4,
          scorePercent: 80,
        },
      ],
      totalLength: 1,
    };
    mockedAxios.get.mockResolvedValue({ data: page });
    await expect(fetchAdminInterviewSessions({ pageNumber: 1 })).resolves.toBe(page);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Request failed with status code 403"));
    await expect(fetchAdminInterviewSessions({ pageNumber: 1 })).rejects.toThrow(
      "Request failed with status code 403"
    );
  });
});

describe("fetchAdminInterviewSessionDetail", () => {
  test("requests /admin/interview-sessions/{id}", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchAdminInterviewSessionDetail("s1");
    expect(mockedAxios.get).toHaveBeenCalledWith(ADMIN_INTERVIEW_SESSION_BY_ID("s1"));
  });

  test("returns the AdminSessionDetail body unchanged", async () => {
    const detail: AdminSessionDetail = {
      id: "s1",
      status: "completed",
      startedAt: "2024-01-01T00:00:00Z",
      endedAt: "2024-01-01T01:00:00Z",
      durationMinutes: 60,
      candidate: { userId: "u1", email: "a@b.com", firstName: "A", lastName: "B" },
      interview: { id: "m1", title: "System Design", difficulty: "Medium", durationMinutes: 60 },
      scoring: {
        totalQuestions: 5,
        answeredQuestions: 5,
        skippedQuestions: 0,
        correctQuestions: 4,
        scorePercent: 80,
        topicBreakdown: { networking: { correct: 2, total: 2 } },
      },
      recording: {
        videoStatus: "ready",
        videoUrl: "https://s3/camera.mp4",
        screenVideoUrl: "https://s3/screen.mp4",
        streams: [{ kind: "camera", chunks: 4, durationSeconds: 600 }],
      },
      questions: [
        {
          id: "q1",
          ordinal: 1,
          type: "mcq",
          questionSource: "mock_question",
          questionRefId: "mq1",
          question: { options: ["A", "B"], correctAnswer: 0 },
          status: "answered",
          answer: { selected: 0 },
          score: 1,
          isCorrect: true,
        },
      ],
    };
    mockedAxios.get.mockResolvedValue({ data: detail });
    await expect(fetchAdminInterviewSessionDetail("s1")).resolves.toBe(detail);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Not Found"));
    await expect(fetchAdminInterviewSessionDetail("missing")).rejects.toThrow("Not Found");
  });
});
