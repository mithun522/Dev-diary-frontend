jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  uploadRecordingChunk,
  listRecordingChunks,
  type VideoChunk,
} from "../../../src/api/services/recordingUpload.service";
import {
  INTERVIEW_SESSION_VIDEO_CHUNKS,
  INTERVIEW_SESSION_VIDEO_CHUNKS_UPLOAD_URL,
} from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

let fetchMock: jest.Mock;

const chunkBlob = (mimeType = "video/webm;codecs=vp8,opus") =>
  new Blob(["chunk-bytes"], { type: mimeType });

const primeUploadFlow = (s3Key = "sessions/s1/camera/0.webm") => {
  mockedAxios.post
    .mockResolvedValueOnce({
      data: { uploadUrl: "https://s3.example/put?sig=abc", s3Key },
    })
    .mockResolvedValueOnce({
      data: {
        id: "vc1",
        sessionId: "s1",
        kind: "camera",
        chunkIndex: 0,
        s3Key,
        durationSeconds: null,
        uploadedAt: "2024-01-01T00:00:00Z",
      },
    });
};

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe("uploadRecordingChunk — presigned URL request", () => {
  test("requests an upload URL with { kind, chunkIndex, contentType }", async () => {
    primeUploadFlow();
    await uploadRecordingChunk("s1", "camera", 0, chunkBlob());
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      1,
      INTERVIEW_SESSION_VIDEO_CHUNKS_UPLOAD_URL("s1"),
      { kind: "camera", chunkIndex: 0, contentType: "video/webm" }
    );
    expect(INTERVIEW_SESSION_VIDEO_CHUNKS_UPLOAD_URL("s1")).toBe(
      `${INTERVIEW_SESSION_VIDEO_CHUNKS("s1")}/upload-url`
    );
  });

  test.each(["camera", "screen"] as const)(
    "threads the %s recording kind through to the presign request",
    async (kind) => {
      primeUploadFlow();
      await uploadRecordingChunk("s1", kind, 3, chunkBlob());
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        INTERVIEW_SESSION_VIDEO_CHUNKS_UPLOAD_URL("s1"),
        { kind, chunkIndex: 3, contentType: "video/webm" }
      );
    }
  );

  test("always sends the plain contentType enum value, never the recorder's codec-suffixed mimeType", async () => {
    primeUploadFlow();
    await uploadRecordingChunk("s1", "camera", 0, chunkBlob("video/webm;codecs=vp8,opus"));
    const [, body] = mockedAxios.post.mock.calls[0];
    expect((body as { contentType: string }).contentType).toBe("video/webm");
  });
});

describe("uploadRecordingChunk — S3 PUT", () => {
  test("PUTs the raw chunk bytes to the presigned URL with the pinned Content-Type", async () => {
    primeUploadFlow();
    const chunk = chunkBlob();
    await uploadRecordingChunk("s1", "camera", 0, chunk);
    expect(fetchMock).toHaveBeenCalledWith("https://s3.example/put?sig=abc", {
      method: "PUT",
      headers: { "Content-Type": "video/webm" },
      body: chunk,
    });
  });

  test("uploads via bare fetch, so no Authorization header or interceptor is attached", async () => {
    primeUploadFlow();
    await uploadRecordingChunk("s1", "camera", 0, chunkBlob());
    const [, init] = fetchMock.mock.calls[0];
    expect(Object.keys(init.headers)).toEqual(["Content-Type"]);
  });

  test("runs the three steps in order: presign, upload, confirm", async () => {
    const order: string[] = [];
    mockedAxios.post
      .mockImplementationOnce(async () => {
        order.push("presign");
        return { data: { uploadUrl: "https://s3.example/put", s3Key: "k" } };
      })
      .mockImplementationOnce(async () => {
        order.push("confirm");
        return { data: {} };
      });
    fetchMock.mockImplementation(async () => {
      order.push("upload");
      return { ok: true, status: 200 };
    });

    await uploadRecordingChunk("s1", "camera", 0, chunkBlob());

    expect(order).toEqual(["presign", "upload", "confirm"]);
  });
});

describe("uploadRecordingChunk — chunk confirmation", () => {
  test("POSTs { kind, chunkIndex, s3Key, durationSeconds } to the video-chunks collection", async () => {
    primeUploadFlow("sessions/s1/camera/2.webm");
    await uploadRecordingChunk("s1", "camera", 2, chunkBlob(), 10);
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      INTERVIEW_SESSION_VIDEO_CHUNKS("s1"),
      { kind: "camera", chunkIndex: 2, s3Key: "sessions/s1/camera/2.webm", durationSeconds: 10 }
    );
  });

  test("threads the presign response's s3Key into the confirm call, not a locally-derived one", async () => {
    primeUploadFlow("server-assigned-key.webm");
    await uploadRecordingChunk("s1", "screen", 0, chunkBlob());
    const [, confirmBody] = mockedAxios.post.mock.calls[1];
    expect((confirmBody as { s3Key: string }).s3Key).toBe("server-assigned-key.webm");
  });

  test("sends durationSeconds as an explicit key even when omitted (undefined)", async () => {
    primeUploadFlow();
    await uploadRecordingChunk("s1", "camera", 0, chunkBlob());
    const [, confirmBody] = mockedAxios.post.mock.calls[1];
    expect(Object.keys(confirmBody as object)).toEqual([
      "kind",
      "chunkIndex",
      "s3Key",
      "durationSeconds",
    ]);
    expect((confirmBody as { durationSeconds?: number }).durationSeconds).toBeUndefined();
  });

  test("resolves with undefined (no return value)", async () => {
    primeUploadFlow();
    await expect(uploadRecordingChunk("s1", "camera", 0, chunkBlob())).resolves.toBeUndefined();
  });
});

describe("uploadRecordingChunk — failure paths", () => {
  test("never calls fetch or confirms the chunk if requesting the presigned URL fails", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("presign failed"));
    await expect(
      uploadRecordingChunk("s1", "camera", 0, chunkBlob())
    ).rejects.toThrow("presign failed");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  test("propagates and never confirms the chunk if the S3 upload rejects at the network level", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { uploadUrl: "https://s3.example/put", s3Key: "k" },
    });
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      uploadRecordingChunk("s1", "camera", 0, chunkBlob())
    ).rejects.toThrow("Failed to fetch");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  test("propagates a rejection from the final confirm call", async () => {
    mockedAxios.post
      .mockResolvedValueOnce({ data: { uploadUrl: "https://s3.example/put", s3Key: "k" } })
      .mockRejectedValueOnce(new Error("confirm failed"));

    await expect(
      uploadRecordingChunk("s1", "camera", 0, chunkBlob())
    ).rejects.toThrow("confirm failed");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // KNOWN DEFECT (mirrors the identical bug in blogs.service.createBlog's cover-image upload):
  // the S3 PUT response is awaited but `response.ok` is never checked, so a non-2xx S3 response
  // (expired signature, oversized chunk, etc.) is silently treated as success and the chunk is
  // still confirmed as uploaded even though its bytes were never stored.
  test("KNOWN DEFECT: a 403 from S3 is ignored — the chunk is still confirmed as uploaded", async () => {
    primeUploadFlow();
    fetchMock.mockResolvedValue({ ok: false, status: 403, statusText: "Forbidden" });

    await expect(
      uploadRecordingChunk("s1", "camera", 0, chunkBlob())
    ).resolves.toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  test("KNOWN DEFECT: a 500 from S3 likewise does not abort the confirm step", async () => {
    primeUploadFlow();
    fetchMock.mockResolvedValue({ ok: false, status: 500, statusText: "Internal Server Error" });

    await expect(
      uploadRecordingChunk("s1", "camera", 0, chunkBlob())
    ).resolves.toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});

describe("listRecordingChunks", () => {
  test("requests /interview-sessions/{sessionId}/video-chunks", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await listRecordingChunks("s1");
    expect(mockedAxios.get).toHaveBeenCalledWith(INTERVIEW_SESSION_VIDEO_CHUNKS("s1"));
  });

  test("returns the VideoChunk array unchanged", async () => {
    const chunks: VideoChunk[] = [
      {
        id: "vc1",
        sessionId: "s1",
        kind: "camera",
        chunkIndex: 0,
        s3Key: "sessions/s1/camera/0.webm",
        durationSeconds: 10,
        uploadedAt: "2024-01-01T00:00:00Z",
      },
    ];
    mockedAxios.get.mockResolvedValue({ data: chunks });
    await expect(listRecordingChunks("s1")).resolves.toBe(chunks);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(listRecordingChunks("s1")).rejects.toThrow("Network Error");
  });
});
