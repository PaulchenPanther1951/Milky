import { useEffect, useRef, useState } from "react";
import type { Profile, ThemeKey } from "../types";
import { THEME_ORDER, THEMES, applyTheme } from "../lib/themes";
import { compressImage, blobToObjectUrl } from "../lib/image";
import { savePhoto, deletePhoto, newId } from "../lib/db";

interface ProfileEditorProps {
  initial?: Profile;
  onSubmit: (profile: Profile) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

/**
 * Reusable profile creation/edit form. Used both in Onboarding (Schritt 3)
 * and in the profile switcher when adding/editing a child later.
 */
export function ProfileEditor({ initial, onSubmit, onCancel, submitLabel = "Festhalten" }: ProfileEditorProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [birthdate, setBirthdate] = useState(initial?.birthdate ?? "");
  const [theme, setTheme] = useState<ThemeKey>(initial?.theme ?? "galaxie");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const existingPhotoKey = initial?.photoKey;
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Live theme preview as user picks
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Revoke preview on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // Close source menu on ESC
  useEffect(() => {
    if (!sourceMenuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSourceMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sourceMenuOpen]);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-pick same file
    if (!file) return;
    try {
      const blob = await compressImage(file, 800, 0.85); // smaller for avatar
      setPendingBlob(blob);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(blobToObjectUrl(blob));
    } catch (err) {
      console.error("photo compression failed", err);
      alert("Foto konnte nicht verarbeitet werden.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      let nextPhotoKey = existingPhotoKey;
      if (pendingBlob) {
        if (existingPhotoKey) {
          try { await deletePhoto(existingPhotoKey); } catch { /* ignore */ }
        }
        nextPhotoKey = await savePhoto(pendingBlob);
      }
      const now = new Date().toISOString();
      const profile: Profile = {
        id: initial?.id ?? newId("profile"),
        name: name.trim(),
        birthdate: birthdate || null,
        photoKey: nextPhotoKey,
        theme,
        createdAt: initial?.createdAt ?? now,
      };
      await onSubmit(profile);
    } finally {
      setSubmitting(false);
    }
  }

  const previewUrl = photoPreview;

  return (
    <form className="profile-editor" onSubmit={handleSubmit}>
      <div className="field photo-field">
        <button
          type="button"
          className="photo-picker"
          onClick={() => setSourceMenuOpen(true)}
          aria-label="Foto auswaehlen"
          aria-haspopup="menu"
          aria-expanded={sourceMenuOpen}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="" />
          ) : initial?.photoKey && !pendingBlob ? (
            <PhotoFromKey photoKey={initial.photoKey} />
          ) : (
            <span className="photo-placeholder">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="9" r="3.5" />
                <path d="M5 19c1-3.5 4-5 7-5s6 1.5 7 5" />
              </svg>
              <span className="photo-placeholder-text">Foto</span>
            </span>
          )}
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPickFile}
          hidden
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          hidden
        />
        <p className="field-hint">Tippe das Bild an, um ein Foto auszuwaehlen.</p>
      </div>

      {sourceMenuOpen && (
        <div
          className="photo-source-veil"
          role="dialog"
          aria-modal="true"
          aria-label="Foto-Quelle wählen"
          onClick={() => setSourceMenuOpen(false)}
        >
          <div className="photo-source-sheet" onClick={(e) => e.stopPropagation()}>
            <p className="photo-source-title">{previewUrl || initial?.photoKey ? "Foto ändern" : "Foto hinzufügen"}</p>
            <button
              type="button"
              className="photo-source-btn"
              onClick={() => { setSourceMenuOpen(false); cameraInputRef.current?.click(); }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="6" width="18" height="14" rx="2" />
                <circle cx="12" cy="13" r="3.2" />
                <path d="M8 6l1.5-2h5L16 6" />
              </svg>
              <span>Foto aufnehmen</span>
            </button>
            <button
              type="button"
              className="photo-source-btn"
              onClick={() => { setSourceMenuOpen(false); galleryInputRef.current?.click(); }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="M21 17l-5-5-5 5-3-3-5 5" />
              </svg>
              <span>Aus Galerie wählen</span>
            </button>
            <button type="button" className="photo-source-cancel" onClick={() => setSourceMenuOpen(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="profile-name">Wie heisst das Kind?</label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vorname genuegt"
          autoComplete="off"
          required
          maxLength={40}
        />
      </div>

      <div className="field">
        <label htmlFor="profile-birthdate">Geburtsdatum (optional)</label>
        <input
          id="profile-birthdate"
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
        <p className="field-hint">Wenn gesetzt, schreibt Milky bei jedem Zahn das Alter mit.</p>
      </div>

      <div className="field">
        <span className="field-label">Welche Welt?</span>
        <div className="theme-grid">
          {THEME_ORDER.map((key) => {
            const t = THEMES[key];
            const selected = theme === key;
            return (
              <button
                key={key}
                type="button"
                className={`theme-card ${selected ? "selected" : ""}`}
                onClick={() => setTheme(key)}
                aria-pressed={selected}
              >
                <ThemePreview theme={key} />
                <span className="theme-name">{t.name}</span>
                <span className="theme-short">{t.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Abbrechen
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting || !name.trim()}>
          {submitting ? "..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function PhotoFromKey({ photoKey }: { photoKey: string }) {
  // Inline lookup using usePhoto to avoid double-fetching
  // Lazy import to keep this component self-contained
  return <PhotoFromKeyInner photoKey={photoKey} />;
}

import { usePhoto } from "../lib/use-photo";
function PhotoFromKeyInner({ photoKey }: { photoKey: string }) {
  const url = usePhoto(photoKey);
  return url ? <img src={url} alt="" /> : <span className="photo-placeholder-text">…</span>;
}

function ThemePreview({ theme }: { theme: ThemeKey }) {
  const t = THEMES[theme];
  return (
    <div
      className="theme-preview"
      style={{
        background: `radial-gradient(ellipse at 50% 100%, ${t.vars["--bg-soft"]} 0%, ${t.vars["--bg-deep"]} 80%)`,
      }}
    >
      <div
        className="theme-preview-glow"
        style={{
          background: `radial-gradient(circle, ${t.vars["--accent"]} 0%, transparent 70%)`,
        }}
      />
      <span
        className="theme-preview-star"
        style={{
          background: `radial-gradient(circle at 38% 38%, ${t.vars["--star"]} 0%, ${t.vars["--star-warm"]} 60%, ${t.vars["--accent"]} 100%)`,
          boxShadow: `0 0 12px ${t.vars["--accent"]}`,
        }}
      />
    </div>
  );
}
