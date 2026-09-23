jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  updateSessionStrikeCount,
  startInterviewSession,
  getInterviewSession,
  listInterviewSessions,
  runSessionCodingQuestion,
  submitSessionCodingQuestion,
  answerSessionQuestion,
  endInterviewSession,
  getSessionVideoPlayback,
  isCodingCatalogQuestion,
  type InterviewSession,
  type InterviewSessionQuestion,
  type SessionVideoPlayback,
} from "../../../src/api/services/interviewSession.service";
import {
  INTERVIEW_SESSIONS,
  INTERVIEW_SESSION_BY_ID,
  INTERVIEW_SESSION_END,
  INTERVIEW_SESSION_QUESTION_RUN,
  INTERVIEW_SESSION_QUESTION_SUBMIT,
  INTERVIEW_SESSION_QUESTION_ANSWER,
  INTERVIEW_SESSION_VIDEO,
  INTERVIEW_SESSION_STRIKES,
} from "../../../src/constants/Api";
import type { JudgeResult } from "../../../src/data/catalogData";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

const session: InterviewSession = {
  id: "s1",
  mockInterviewId: "m1",
  status: "in_progress",
  startedAt: "2024-01-01T00:00:00Z",
  videoStatus: "pending",
  questions: [],
};

describe("updateSessionStrikeCount", () => {
  test("PUTs { count } to /interview-sessions/{id}/strikes", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "s1", strikeCount: 2 } });
    await updateSessionStrikeCount("s1", 2);
    expect(mockedAxios.put).toHaveBeenCalledWith(INTERVIEW_SESSION_STRIKES("s1"), {
      count: 2,
    });
  });

  test("sends the count as an absolute total, not a delta — exactly { count }", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateSessionStrikeCount("s1", 5);
    const [, body] = mockedAxios.put.mock.calls[0];
    expect(body).toEqual({ count: 5 });
    expect(Object.keys(body as object)).toEqual(["count"]);
  });

  test("returns the strikes response unchanged", async () => {
    const response = { id: "s1", strikeCount: 3 };
    mockedAxios.put.mockResolvedValue({ data: response });
    await expect(updateSessionStrikeCount("s1", 3)).resolves.toBe(response);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Bad Request"));
    await expect(updateSessionStrikeCount("s1", 1)).rejects.toThrow("Bad Request");
  });
});

describe("startInterviewSession", () => {
  test("POSTs { mockInterviewId } to /interview-sessions", async () => {
    mockedAxios.post.mockResolvedValue({ data: session });
    await startInterviewSession("m1");
    expect(mockedAxios.post).toHaveBeenCalledWith(INTERVIEW_SESSIONS, {
      mockInterviewId: "m1",
    });
  });

  test("returns the created session unchanged", async () => {
    mockedAxios.post.mockResolvedValue({ data: session });
    await expect(startInterviewSession("m1")).resolves.toBe(session);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Not Found"));
    await expect(startInterviewSession("missing")).rejects.toThrow("Not Found");
  });
});

describe("getInterviewSession", () => {
  test("requests /interview-sessions/{id}", async () => {
    mockedAxios.get.mockResolvedValue({ data: session });
    await getInterviewSession("s1");
    expect(mockedAxios.get).toHaveBeenCalledWith(INTERVIEW_SESSION_BY_ID("s1"));
  });

  test("returns the session unchanged", async () => {
    mockedAxios.get.mockResolvedValue({ data: session });
    await expect(getInterviewSession("s1")).resolves.toBe(session);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Not Found"));
    await expect(getInterviewSession("missing")).rejects.toThrow("Not Found");
  });
});

describe("listInterviewSessions", () => {
  test("requests the bare /interview-sessions collection (caller's own sessions)", async () => {
    mockedAxios.get.mockResolvedValue({ data: [session] });
    await listInterviewSessions();
    expect(mockedAxios.get).toHaveBeenCalledWith(INTERVIEW_SESSIONS);
  });

  test("returns the sessions array unchanged", async () => {
    mockedAxios.get.mockResolvedValue({ data: [session] });
    await expect(listInterviewSessions()).resolves.toEqual([session]);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(listInterviewSessions()).rejects.toThrow("Network Error");
  });
});

describe("runSessionCodingQuestion", () => {
  test("PUTs { sourceCode, language } to .../questions/{id}/run", async () => {
    const judge: JudgeResult = { status: "ACCEPTED", results: [], runtimeMs: 12 };
    mockedAxios.put.mockResolvedValue({ data: judge });
    await runSessionCodingQuestion("s1", "q1", "print(1)", "python");
    expect(mockedAxios.put).toHaveBeenCalledWith(
      INTERVIEW_SESSION_QUESTION_RUN("s1", "q1"),
      { sourceCode: "print(1)", language: "python" }
    );
    expect(INTERVIEW_SESSION_QUESTION_RUN("s1", "q1")).toBe(
      `${INTERVIEW_SESSIONS}/s1/questions/q1/run`
    );
  });

  test("does not persist a submission row — returns the raw JudgeResult, no submissionId", async () => {
    const judge: JudgeResult = { status: "WRONG_ANSWER", results: [], runtimeMs: 8 };
    mockedAxios.put.mockResolvedValue({ data: judge });
    await expect(runSessionCodingQuestion("s1", "q1", "code", "java")).resolves.toBe(judge);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Compile Error"));
    await expect(runSessionCodingQuestion("s1", "q1", "bad code", "cpp")).rejects.toThrow(
      "Compile Error"
    );
  });
});

describe("submitSessionCodingQuestion", () => {
  test("PUTs { sourceCode, language } to .../questions/{id}/submit", async () => {
    const questionResult: InterviewSessionQuestion = {
      id: "q1",
      ordinal: 1,
      type: "coding",
      questionSource: "dsa_catalog",
      questionRefId: "p1",
      question: {
        id: "p1",
        title: "Two Sum",
        difficulty: "Easy",
        topics: ["arrays"],
        description: "desc",
        functionName: "twoSum",
        paramNames: ["nums", "target"],
        starterCode: { javascript: "function twoSum(){}" },
        sampleTestCases: [],
      },
      status: "answered",
      answer: { submissionId: "sub1", status: "ACCEPTED", language: "javascript" },
      score: 100,
    };
    mockedAxios.put.mockResolvedValue({ data: questionResult });
    await submitSessionCodingQuestion("s1", "q1", "function twoSum(){}", "javascript");
    expect(mockedAxios.put).toHaveBeenCalledWith(
      INTERVIEW_SESSION_QUESTION_SUBMIT("s1", "q1"),
      { sourceCode: "function twoSum(){}", language: "javascript" }
    );
    expect(INTERVIEW_SESSION_QUESTION_SUBMIT("s1", "q1")).toBe(
      `${INTERVIEW_SESSIONS}/s1/questions/q1/submit`
    );
  });

  test("returns the updated InterviewSessionQuestion, including its persisted score", async () => {
    const questionResult: InterviewSessionQuestion = {
      id: "q1",
      ordinal: 1,
      type: "coding",
      questionSource: "dsa_catalog",
      questionRefId: "p1",
      question: {
        id: "p1",
        title: "Two Sum",
        difficulty: "Easy",
        topics: [],
        description: "",
        functionName: "twoSum",
        paramNames: [],
        starterCode: {},
        sampleTestCases: [],
      },
      status: "answered",
      answer: { submissionId: "sub1", status: "WRONG_ANSWER", language: "python" },
      score: 0,
    };
    mockedAxios.put.mockResolvedValue({ data: questionResult });
    await expect(
      submitSessionCodingQuestion("s1", "q1", "code", "python")
    ).resolves.toBe(questionResult);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Session ended"));
    await expect(
      submitSessionCodingQuestion("s1", "q1", "code", "javascript")
    ).rejects.toThrow("Session ended");
  });
});

describe("answerSessionQuestion", () => {
  test("PUTs { answer } to .../questions/{id}/answer", async () => {
    const questionResult = { id: "q1" } as unknown as InterviewSessionQuestion;
    mockedAxios.put.mockResolvedValue({ data: questionResult });
    await answerSessionQuestion("s1", "q1", "It depends on the tradeoffs");
    expect(mockedAxios.put).toHaveBeenCalledWith(
      INTERVIEW_SESSION_QUESTION_ANSWER("s1", "q1"),
      { answer: "It depends on the tradeoffs" }
    );
    expect(INTERVIEW_SESSION_QUESTION_ANSWER("s1", "q1")).toBe(
      `${INTERVIEW_SESSIONS}/s1/questions/q1/answer`
    );
  });

  test("sends exactly { answer } — no other fields", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await answerSessionQuestion("s1", "q1", "text");
    const [, body] = mockedAxios.put.mock.calls[0];
    expect(Object.keys(body as object)).toEqual(["answer"]);
  });

  test("returns the updated question unchanged", async () => {
    const questionResult = { id: "q1", score: 1 } as unknown as InterviewSessionQuestion;
    mockedAxios.put.mockResolvedValue({ data: questionResult });
    await expect(answerSessionQuestion("s1", "q1", "text")).resolves.toBe(questionResult);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Session ended"));
    await expect(answerSessionQuestion("s1", "q1", "text")).rejects.toThrow("Session ended");
  });
});

describe("endInterviewSession", () => {
  test("PUTs to /interview-sessions/{id}/end with no request body", async () => {
    mockedAxios.put.mockResolvedValue({ data: session });
    await endInterviewSession("s1");
    expect(mockedAxios.put).toHaveBeenCalledWith(INTERVIEW_SESSION_END("s1"));
    expect(mockedAxios.put.mock.calls[0]).toHaveLength(1);
    expect(INTERVIEW_SESSION_END("s1")).toBe(`${INTERVIEW_SESSIONS}/s1/end`);
  });

  test("returns the ended session unchanged", async () => {
    const ended = { ...session, status: "completed" as const, endedAt: "2024-01-01T01:00:00Z" };
    mockedAxios.put.mockResolvedValue({ data: ended });
    await expect(endInterviewSession("s1")).resolves.toBe(ended);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Already ended"));
    await expect(endInterviewSession("s1")).rejects.toThrow("Already ended");
  });
});

describe("getSessionVideoPlayback", () => {
  test("requests /interview-sessions/{id}/video", async () => {
    const playback: SessionVideoPlayback = {
      videoStatus: "processing",
      videoUrl: null,
      screenVideoUrl: null,
    };
    mockedAxios.get.mockResolvedValue({ data: playback });
    await getSessionVideoPlayback("s1");
    expect(mockedAxios.get).toHaveBeenCalledWith(INTERVIEW_SESSION_VIDEO("s1"));
  });

  test("returns null urls while processing, and returns real urls once ready", async () => {
    const notReady: SessionVideoPlayback = {
      videoStatus: "processing",
      videoUrl: null,
      screenVideoUrl: null,
    };
    mockedAxios.get.mockResolvedValueOnce({ data: notReady });
    await expect(getSessionVideoPlayback("s1")).resolves.toEqual(notReady);

    const ready: SessionVideoPlayback = {
      videoStatus: "ready",
      videoUrl: "https://s3/camera.mp4",
      screenVideoUrl: "https://s3/screen.mp4",
    };
    mockedAxios.get.mockResolvedValueOnce({ data: ready });
    await expect(getSessionVideoPlayback("s1")).resolves.toEqual(ready);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Not Found"));
    await expect(getSessionVideoPlayback("missing")).rejects.toThrow("Not Found");
  });
});

describe("isCodingCatalogQuestion", () => {
  const base = {
    id: "q1",
    ordinal: 1,
    questionRefId: "p1",
    status: "pending" as const,
    answer: null,
    score: null,
  };

  test("is true only for a coding question sourced from the shared dsa catalog", () => {
    const q: InterviewSessionQuestion = {
      ...base,
      type: "coding",
      questionSource: "dsa_catalog",
      question: {
        id: "p1",
        title: "T",
        difficulty: "Easy",
        topics: [],
        description: "",
        functionName: "f",
        paramNames: [],
        starterCode: {},
        sampleTestCases: [],
      },
    };
    expect(isCodingCatalogQuestion(q)).toBe(true);
  });

  test("is false for a coding question that fell back to the mock interview's own content", () => {
    const q: InterviewSessionQuestion = {
      ...base,
      type: "coding",
      questionSource: "mock_question",
      question: { question: "Reverse a string", difficulty: "Easy", topics: [] },
    };
    expect(isCodingCatalogQuestion(q)).toBe(false);
  });

  test("is false for a non-coding question type even when sourced from the dsa catalog", () => {
    const q: InterviewSessionQuestion = {
      ...base,
      type: "mcq",
      questionSource: "dsa_catalog",
      question: {
        id: "p1",
        title: "T",
        difficulty: "Easy",
        topics: [],
        description: "",
        functionName: "f",
        paramNames: [],
        starterCode: {},
        sampleTestCases: [],
      },
    };
    expect(isCodingCatalogQuestion(q)).toBe(false);
  });
});
