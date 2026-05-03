import { useEffect, useRef, useState } from "react";
import { compressImage, blobToObjectUrl } from "../lib/image";
import { usePhoto } from "../lib/use-photo";

export interface PhotoSlotState {
  /** Existing photo key from a prior save */
  existingKey?: string;
  /** Newly picked, not yet persisted */
  pendingBlob: Blob | null;
  /** User explicitly removed the photo */
  removed: boolean;
}

interface Props {
  label: string;
  hint?: string;
  state: PhotoSlotState;
  onChange: (next: PhotoSlotState) => void;
}

export function PhotoSlot({ label, hint, state, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  // Object URL lifecycle for the pending blob
  useEffect(() => {
    if (!state.pendingBlob) {
      setPendingUrl(null);
      return;
    }
    const url = blobToObjectUrl(state.pendingBlob);
    setPendingUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [state.pendingBlob]);

  // Existing photo (if any) only shown when no pending blob and not removed
  const showExisting = !state.pendingBlob && !state.removed && Boolean(state.existingKey);
  const existingUrl = usePhoto(showExisting ? state.existingKey : undefined);

  const previewUrl = state.pendingBlob ? pendingUrl : showExisting ? existingUrl : null;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const blob = await compressImage(file, 1600, 0.85);
      onChange({ ...state, pendingBlob: blob, removed: false });
    } catch (err) {
      console.error("photo compression failed", err);
      alert("Foto konnte nicht verarbeitet werden.");
    }
  }

  function handleRemove() {
    onChange({ ...state, pendingBlob: null, removed: true });
  }

  return (
    <div className="photo-slot">
      <button
        type="button"
        className={`photo-slot-area ${previewUrl ? "has-image" : "empty"}`}
        onClick={() => fileRef.current?.click()}
        aria-label={`${label} ${previewUrl ? "ändern" : "hinzufügen"}`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" />
        ) : (
          <div className="photo-slot-empty">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="6" width="18" height="14" rx="2" />
              <circle cx="12" cy="13" r="3" />
              <path d="M8 6l1.5-2h5L16 6" />
            </svg>
            <span className="photo-slot-empty-text">{label}</span>
            {hint && <span className="photo-slot-hint">{hint}</span>}
          </div>
        )}
      </button>
      {previewUrl && (
        <button
          type="button"
          className="photo-slot-remove"
          onClick={handleRemove}
          aria-label={`${label} entfernen`}
        >
          ×
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
        hidden
      />
      <p className="photo-slot-label">{label}</p>
    </div>
  );
}
