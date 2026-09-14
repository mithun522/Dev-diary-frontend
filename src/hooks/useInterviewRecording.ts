import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  uploadRecordingChunk,
  listRecordingChunks,
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

// How long stopAndFinalize will wait for outstanding chunk uploads before giving up and letting
// the interview finish anyway. Long enough for a final ~60s chunk on a slow connection, short
// enough that a hung request never traps the candidate on the "ending" screen. Anything that does
// land in S3 after this is still picked up — the backend stitches from the bucket, not from the
// confirmed-chunk table.
const FINAL_UPLOAD_GRACE_MS = 20_000;

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
  // `resume: true` looks up how many chunks were already uploaded for this session (a reload
  // resuming an in-progress session) and continues chunk numbering from there, instead of
  // restarting at 0 and silently overwriting the earlier part of the recording — chunks upsert by
  // (session, kind, chunkIndex), so index 0 after a reload would clobber the original index 0.
  startRecording: (sessionId: string, resume?: boolean) => void;
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
  // Every in-flight chunk upload. stopAndFinalize drains this before the interview is allowed to
  // end, so the final chunk is in S3 and confirmed before the backend is told to stitch.
  const pendingUploadsRef = useRef<Promise<void>[]>([]);

  const handleChunk = useCallback((kind: RecordingKind, blob: Blob) => {
    const state = recordersRef.current[kind];
    if (!state || !sessionIdRef.current) return;

    state.chunks.push(blob); // local fallback copy, kept regardless of upload outcome
    const sequence = state.sequence;
    state.sequence += 1;
    const durationSeconds = Math.round((Date.now() - state.chunkStartedAt) / 1000);
    state.chunkStartedAt = Date.now();

    const upload = uploadRecordingChunk(
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

    // Tracked (not fire-and-forget) so stopAndFinalize can wait for it. Already .catch()-ed above,
    // so a failed upload settles rather than rejecting the drain.
    pendingUploadsRef.current.push(upload);
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
    async (sessionId: string, resume = false) => {
      sessionIdRef.current = sessionId;

      // On a fresh session both start at 0 (unchanged). On resume, pick up right after the
      // highest chunk index already confirmed for each stream — using max+1 rather than a plain
      // count so a previously-failed confirm (which never reached the backend) can't cause a
      // collision either.
      const startSequence: Partial<Record<RecordingKind, number>> = {};
      if (resume) {
        try {
          const existingChunks = await listRecordingChunks(sessionId);
          (["camera", "screen"] as const).forEach((kind) => {
            const maxIndex = existingChunks
              .filter((c) => c.kind === kind)
              .reduce((max, c) => Math.max(max, c.chunkIndex), -1);
            if (maxIndex >= 0) startSequence[kind] = maxIndex + 1;
          });
        } catch {
          // Couldn't look up existing chunks — fall back to starting at 0. Rare (the session was
          // just confirmed to exist a moment ago), and the alternative is blocking the resumed
          // interview entirely over a transient read failure.
        }
      }

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
          sequence: startSequence[kind] ?? 0,
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

    // Stopping a MediaRecorder emits one last `dataavailable` (the tail of the current chunk)
    // before it fires `stop`, so by the time these resolve the final chunk's upload has been
    // started and registered in pendingUploadsRef.
    await Promise.all([stopOne(states.camera), stopOne(states.screen)]);

    // Drain every upload, including those final chunks. Without this the caller goes straight on
    // to PUT /end, which queues backend stitching immediately — and a last chunk still in flight
    // would not be in S3 yet, so it would be missing from the stitched recording entirely.
    const pending = pendingUploadsRef.current;
    pendingUploadsRef.current = [];
    if (pending.length > 0) {
      let graceTimer: ReturnType<typeof setTimeout> | undefined;
      await Promise.race([
        Promise.allSettled(pending),
        new Promise<void>((resolve) => {
          graceTimer = setTimeout(resolve, FINAL_UPLOAD_GRACE_MS);
        }),
      ]);
      clearTimeout(graceTimer);
    }

    [cameraStreamRef.current, screenStreamRef.current].forEach((stream) =>
      stream?.getTracks().forEach((track) => track.stop())
    );

    setIsRecording(false);
    // No dedicated "finalize" call — PUT /interview-sessions/{id}/end (called right after this)
    // flips videoStatus to "processing" and queues the stitching job, which is why every chunk
    // has to have landed before this resolves.
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
