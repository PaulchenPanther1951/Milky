import { useEffect, useRef, useState } from "react";
import { useAudio } from "../lib/use-audio";

export interface AudioSlotState {
  existingKey?: string;
  pendingBlob: Blob | null;
  removed: boolean;
}

interface Props {
  state: AudioSlotState;
  onChange: (next: AudioSlotState) => void;
}

const MAX_SECONDS = 30;
const PREFERRED_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/ogg;codecs=opus",
];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const t of PREFERRED_TYPES) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}

export function AudioMemo({ state, onChange }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const supported = typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

  // Live URL for newly recorded blob
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!state.pendingBlob) {
      setPendingUrl(null);
      return;
    }
    const url = URL.createObjectURL(state.pendingBlob);
    setPendingUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [state.pendingBlob]);

  const showExisting = !state.pendingBlob && !state.removed && Boolean(state.existingKey);
  const existingUrl = useAudio(showExisting ? state.existingKey : undefined);
  const playbackUrl = state.pendingBlob ? pendingUrl : existingUrl;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracks();
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }

  async function startRecording() {
    setError(null);
    if (!supported) {
      setError("Audio-Aufnahme wird auf diesem Gerät nicht unterstützt.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = mimeType ?? recorder.mimeType ?? "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        stopTracks();
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRecording(false);
        setSeconds(0);
        if (blob.size > 0) {
          onChange({ ...state, pendingBlob: blob, removed: false });
        }
      };
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          if (next >= MAX_SECONDS) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error("audio recording start failed", err);
      const msg = err instanceof Error ? err.message : "Mikrofon nicht verfügbar.";
      setError(msg);
      stopTracks();
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      stopTracks();
      setRecording(false);
      setSeconds(0);
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  function handleRemove() {
    onChange({ ...state, pendingBlob: null, removed: true });
  }

  if (!supported) {
    return (
      <div className="audio-memo unsupported">
        <p className="audio-empty-text">Audio-Aufnahme nicht verfügbar.</p>
      </div>
    );
  }

  return (
    <div className="audio-memo">
      {recording ? (
        <div className="audio-recording">
          <span className="audio-pulse" aria-hidden="true" />
          <span className="audio-time">{formatTime(seconds)} / {formatTime(MAX_SECONDS)}</span>
          <button type="button" className="btn btn-ghost audio-stop" onClick={stopRecording}>
            Stop
          </button>
        </div>
      ) : playbackUrl ? (
        <div className="audio-playback">
          <audio src={playbackUrl} controls preload="metadata" />
          <button
            type="button"
            className="audio-action remove"
            onClick={handleRemove}
            aria-label="Audio entfernen"
          >
            Entfernen
          </button>
          <button
            type="button"
            className="audio-action retake"
            onClick={() => { handleRemove(); startRecording(); }}
          >
            Neu aufnehmen
          </button>
        </div>
      ) : (
        <button type="button" className="audio-record-btn" onClick={startRecording}>
          <span className="audio-record-dot" aria-hidden="true" />
          <span className="audio-record-label">Audio aufnehmen</span>
          <span className="audio-record-hint">bis zu {MAX_SECONDS} Sekunden</span>
        </button>
      )}
      {error && <p className="audio-error">{error}</p>}
    </div>
  );
}

function formatTime(s: number): string {
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}
