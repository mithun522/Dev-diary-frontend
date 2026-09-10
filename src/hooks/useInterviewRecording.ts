import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  uploadRecordingChunk,
  type RecordingKind,
} from "../api/services/recordingUpload.service";

const PREFERRED_MIME_TYPES = [
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=vp9,opus",
  "video/webm",
];

const pickMimeType = () =>
  PREFERRED_MIME_TYPES.find(
    (type) => "MediaRecorder" in window && MediaRecorder.isTypeSupported(type)
  ) ?? "video/webm";

const CHUNK_INTERVAL_MS = 60_000;

interface RecorderState {
  recorder: MediaRecorder;
  stream: MediaStream;
  sequence: number;
  chunks: Blob[];
  chunkStartedAt: number;
}

interface UseInterviewRecordingResult {
  cameraStream: MediaStream | null;
  isRecording: boolean;
  permissionError: string | null;
  uploadDegraded: boolean;
  requestPermissions: () => Promise<boolean>;
  startRecording: (sessionId: string) => void;
  stopAndFinalize: () => Promise<void>;
  downloadLocalRecording: (kind: RecordingKind) => void;
  hasLocalRecording: (kind: RecordingKind) => boolean;
}

// Records the candidate's camera+mic and their shared screen as two independent MediaRecorder
// streams (kept separate rather than canvas-composited into one video — simpler, and lets the
// backend store/process each track on its own). Each is chunked into ~60s Blobs and uploaded as
// they're produced; every chunk is also kept in memory as a local fallback, so a failing/missing
// backend endpoint never loses the recording, only the live upload of it.
export const useInterviewRecording = (): UseInterviewRecordingResult => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [uploadDegraded, setUploadDegraded] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const mimeTypeRef = useRef<string>(pickMimeType());
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recordersRef = useRef<Partial<Record<RecordingKind, RecorderState>>>(
    {}
  );
  const warnedRef = useRef(false);

  const handleChunk = useCallback((kind: RecordingKind, blob: Blob) => {
    const state = recordersRef.current[kind];
    if (!state || !sessionIdRef.current) return;

    state.chunks.push(blob); // local fallback copy, kept regardless of upload outcome
    const sequence = state.sequence;
    state.sequence += 1;
    const durationSeconds = Math.round((Date.now() - state.chunkStartedAt) / 1000);
    state.chunkStartedAt = Date.now();

    uploadRecordingChunk(
      sessionIdRef.current,
      kind,
      sequence,
      blob,
      durationSeconds
    ).catch(() => {
      setUploadDegraded(true);
      if (!warnedRef.current) {
        warnedRef.current = true;
        toast.warn(
          "Recording upload isn't reaching the server — your recording is being kept in this browser tab instead. You can download it after the interview."
        );
      }
    });
  }, []);

  const requestPermissions = useCallback(async () => {
    setPermissionError(null);
    let camera: MediaStream | null = null;

    try {
      camera = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      cameraStreamRef.current = camera;
      screenStreamRef.current = screen;
      setCameraStream(camera);
      return true;
    } catch {
      camera?.getTracks().forEach((track) => track.stop());
      setPermissionError(
        "Camera and screen-recording access are both required to start this interview."
      );
      return false;
    }
  }, []);

  const startRecording = useCallback(
    (sessionId: string) => {
      sessionIdRef.current = sessionId;

      const streams: [RecordingKind, MediaStream | null][] = [
        ["camera", cameraStreamRef.current],
        ["screen", screenStreamRef.current],
      ];

      streams.forEach(([kind, stream]) => {
        if (!stream) return;

        const recorder = new MediaRecorder(stream, {
          mimeType: mimeTypeRef.current,
        });
        recordersRef.current[kind] = {
          recorder,
          stream,
          sequence: 0,
          chunks: [],
          chunkStartedAt: Date.now(),
        };
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) handleChunk(kind, event.data);
        };
        recorder.start(CHUNK_INTERVAL_MS);
      });

      screenStreamRef.current
        ?.getVideoTracks()[0]
        ?.addEventListener("ended", () => {
          toast.warn(
            "Screen sharing was stopped — screen recording ended early, camera recording continues."
          );
          const screenState = recordersRef.current.screen;
          if (screenState && screenState.recorder.state !== "inactive") {
            screenState.recorder.stop();
          }
        });

      setIsRecording(true);
    },
    [handleChunk]
  );

  const stopAndFinalize = useCallback(async () => {
    const states = recordersRef.current;

    const stopOne = (state?: RecorderState) =>
      new Promise<void>((resolve) => {
        if (!state || state.recorder.state === "inactive") {
          resolve();
          return;
        }
        state.recorder.onstop = () => resolve();
        state.recorder.stop();
      });

    await Promise.all([stopOne(states.camera), stopOne(states.screen)]);

    [cameraStreamRef.current, screenStreamRef.current].forEach((stream) =>
      stream?.getTracks().forEach((track) => track.stop())
    );

    setIsRecording(false);
    // No dedicated "finalize" call — PUT /interview-sessions/{id}/end (called right after this)
    // already flips videoStatus to "processing", which is what should trigger any backend
    // stitching pipeline once chunk upload exists.
  }, []);

  const downloadLocalRecording = useCallback((kind: RecordingKind) => {
    const state = recordersRef.current[kind];
    if (!state || state.chunks.length === 0) return;

    const blob = new Blob(state.chunks, { type: mimeTypeRef.current });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-${kind}-recording.webm`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  const hasLocalRecording = useCallback((kind: RecordingKind) => {
    return (recordersRef.current[kind]?.chunks.length ?? 0) > 0;
  }, []);

  return {
    cameraStream,
    isRecording,
    permissionError,
    uploadDegraded,
    requestPermissions,
    startRecording,
    stopAndFinalize,
    downloadLocalRecording,
    hasLocalRecording,
  };
};
