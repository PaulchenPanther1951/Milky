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
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Close on ESC
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

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

  function chooseCamera() {
    setMenuOpen(false);
    cameraRef.current?.click();
  }

  function chooseGallery() {
    setMenuOpen(false);
    galleryRef.current?.click();
  }

  return (
    <div className="photo-slot">
      <button
        type="button"
        className={`photo-slot-area ${previewUrl ? "has-image" : "empty"}`}
        onClick={() => setMenuOpen(true)}
        aria-label={`${label} ${previewUrl ? "ändern" : "hinzufügen"}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
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

      {menuOpen && (
        <div
          className="photo-source-veil"
          role="dialog"
          aria-modal="true"
          aria-label="Foto-Quelle wählen"
          onClick={() => setMenuOpen(false)}
        >
          <div className="photo-source-sheet" onClick={(e) => e.stopPropagation()}>
            <p className="photo-source-title">{previewUrl ? "Foto ändern" : "Foto hinzufügen"}</p>
            <button type="button" className="photo-source-btn" onClick={chooseCamera}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="6" width="18" height="14" rx="2" />
                <circle cx="12" cy="13" r="3.2" />
                <path d="M8 6l1.5-2h5L16 6" />
              </svg>
              <span>Foto aufnehmen</span>
            </button>
            <button type="button" className="photo-source-btn" onClick={chooseGallery}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="M21 17l-5-5-5 5-3-3-5 5" />
              </svg>
              <span>Aus Galerie wählen</span>
            </button>
            <button type="button" className="photo-source-cancel" onClick={() => setMenuOpen(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
        hidden
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        hidden
      />
      <p className="photo-slot-label">{label}</p>
    </div>
  );
}
