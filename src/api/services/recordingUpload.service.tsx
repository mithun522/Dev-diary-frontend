// Recorded interview video upload — interview-simulator-service's `video-chunks` resource, now
// implemented on the backend (confirmed against its openapi.yaml + handlers). Presigned-S3-PUT,
// the same convention as question-bank-service's material uploads: request an upload URL, PUT the
// chunk's bytes straight to S3 (never through a Lambda), then confirm the chunk's metadata.
//
//   POST /interview-sessions/{sessionId}/video-chunks/upload-url
//     body: { kind: "camera"|"screen", chunkIndex: number, contentType: "video/webm"|"video/mp4" }
//     -> 200 { uploadUrl, s3Key }
//   POST /interview-sessions/{sessionId}/video-chunks
//     body: { kind, chunkIndex, s3Key, durationSeconds? }
//     -> 201 VideoChunk   (upserted by session+kind+chunkIndex, so a retried confirm is safe)
//   GET  /interview-sessions/{sessionId}/video-chunks -> VideoChunk[]
//
// `contentType` is a closed enum with no codec suffix, and it's baked into the presigned URL's
// signature — the client's S3 PUT must send that exact Content-Type header back, not
// MediaRecorder's own (codec-suffixed, e.g. "video/webm;codecs=vp8,opus") mimeType, or the
// signature won't match. useInterviewRecording.ts still uses the richer mimeType for the actual
// MediaRecorder and for the local-download fallback Blob — only the upload path is pinned to the
// plain "video/webm" declared here.
//
// There's still no dedicated "finalize" endpoint — PUT /interview-sessions/{id}/end (called once,
// when the interview finishes) is what flips videoStatus to "processing" for whatever backend
// stitching pipeline picks these chunks up next.
import AxiosInstance from "../../utils/AxiosInstance";
import {
  INTERVIEW_SESSION_VIDEO_CHUNKS,
  INTERVIEW_SESSION_VIDEO_CHUNKS_UPLOAD_URL,
} from "../../constants/Api";

export type RecordingKind = "camera" | "screen";

const UPLOAD_CONTENT_TYPE = "video/webm";

export interface VideoChunk {
  id: string;
  sessionId: string;
  kind: RecordingKind;
  chunkIndex: number;
  s3Key: string;
  durationSeconds: number | null;
  uploadedAt: string;
}

export const uploadRecordingChunk = async (
  sessionId: string,
  kind: RecordingKind,
  chunkIndex: number,
  chunk: Blob,
  durationSeconds?: number
): Promise<void> => {
  const uploadUrlResponse = await AxiosInstance.post(
    INTERVIEW_SESSION_VIDEO_CHUNKS_UPLOAD_URL(sessionId),
    { kind, chunkIndex, contentType: UPLOAD_CONTENT_TYPE }
  );
  const { uploadUrl, s3Key } = uploadUrlResponse.data;

  // Plain fetch, not AxiosInstance — this goes straight to S3, not our API, so it must not carry
  // our Authorization header or any of our interceptors.
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": UPLOAD_CONTENT_TYPE },
    body: chunk,
  });

  await AxiosInstance.post(INTERVIEW_SESSION_VIDEO_CHUNKS(sessionId), {
    kind,
    chunkIndex,
    s3Key,
    durationSeconds,
  });
};

export const listRecordingChunks = async (
  sessionId: string
): Promise<VideoChunk[]> => {
  const response = await AxiosInstance.get(
    INTERVIEW_SESSION_VIDEO_CHUNKS(sessionId)
  );
  return response.data;
};
