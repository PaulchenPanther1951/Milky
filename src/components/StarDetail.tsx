import { useEffect, useMemo, useState } from "react";
import type { Profile, ToothEntry } from "../types";
import { findTooth } from "../lib/teeth";
import { entryIdFor } from "../lib/use-entries";
import { savePhoto, deletePhoto, saveAudio, deleteAudio, putEntry, deleteEntry } from "../lib/db";
import { useSettings } from "../lib/settings-context";
import { playStarLight } from "../lib/sound";
import { PhotoSlot, type PhotoSlotState } from "./PhotoSlot";
import { AudioMemo, type AudioSlotState } from "./AudioMemo";

interface Props {
  toothId: string | null;
  profile: Profile;
  existingEntry: ToothEntry | null;
  onClose: () => void;
  onSaved: () => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

function emptyPhotoSlot(existingKey?: string): PhotoSlotState {
  return { existingKey, pendingBlob: null, removed: false };
}

function emptyAudioSlot(existingKey?: string): AudioSlotState {
  return { existingKey, pendingBlob: null, removed: false };
}

export function StarDetail({ toothId, profile, existingEntry, onClose, onSaved }: Props) {
  const [date, setDate] = useState<string>(existingEntry?.date ?? todayIso());
  const [note, setNote] = useState<string>(existingEntry?.note ?? "");
  const [toothFairyGift, setToothFairyGift] = useState<string>(existingEntry?.toothFairyGift ?? "");
  const [showFairyField, setShowFairyField] = useState<boolean>(Boolean(existingEntry?.toothFairyGift));
  const [beforeSlot, setBeforeSlot] = useState<PhotoSlotState>(() => emptyPhotoSlot(existingEntry?.photoBeforeKey));
  const [afterSlot, setAfterSlot] = useState<PhotoSlotState>(() => emptyPhotoSlot(existingEntry?.photoAfterKey));
  const [audioSlot, setAudioSlot] = useState<AudioSlotState>(() => emptyAudioSlot(existingEntry?.audioMemoKey));
  const [submitting, setSubmitting] = useState(false);
  const { soundsEnabled } = useSettings();

  const tooth = useMemo(() => (toothId ? findTooth(toothId) : undefined), [toothId]);

  // Reset form when toothId or existing entry changes
  useEffect(() => {
    if (!toothId) return;
    setDate(existingEntry?.date ?? todayIso());
    setNote(existingEntry?.note ?? "");
    setToothFairyGift(existingEntry?.toothFairyGift ?? "");
    setShowFairyField(Boolean(existingEntry?.toothFairyGift));
    setBeforeSlot(emptyPhotoSlot(existingEntry?.photoBeforeKey));
    setAfterSlot(emptyPhotoSlot(existingEntry?.photoAfterKey));
    setAudioSlot(emptyAudioSlot(existingEntry?.audioMemoKey));
  }, [toothId, existingEntry]);

  // Lock body scroll while open
  useEffect(() => {
    if (!toothId) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [toothId, onClose]);

  if (!toothId || !tooth) return null;

  async function resolvePhotoKey(slot: PhotoSlotState): Promise<string | undefined> {
    if (slot.pendingBlob) {
      if (slot.existingKey) {
        try { await deletePhoto(slot.existingKey); } catch { /* ignore */ }
      }
      return savePhoto(slot.pendingBlob);
    }
    if (slot.removed) {
      if (slot.existingKey) {
        try { await deletePhoto(slot.existingKey); } catch { /* ignore */ }
      }
      return undefined;
    }
    return slot.existingKey;
  }

  async function resolveAudioKey(slot: AudioSlotState): Promise<string | undefined> {
    if (slot.pendingBlob) {
      if (slot.existingKey) {
        try { await deleteAudio(slot.existingKey); } catch { /* ignore */ }
      }
      return saveAudio(slot.pendingBlob);
    }
    if (slot.removed) {
      if (slot.existingKey) {
        try { await deleteAudio(slot.existingKey); } catch { /* ignore */ }
      }
      return undefined;
    }
    return slot.existingKey;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const photoBeforeKey = await resolvePhotoKey(beforeSlot);
      const photoAfterKey = await resolvePhotoKey(afterSlot);
      const audioMemoKey = await resolveAudioKey(audioSlot);
      const now = new Date().toISOString();
      const entry: ToothEntry = {
        id: existingEntry?.id ?? entryIdFor(profile.id, tooth!.id),
        profileId: profile.id,
        toothId: tooth!.id,
        date,
        note: note.trim(),
        photoBeforeKey,
        photoAfterKey,
        toothFairyGift: toothFairyGift.trim() ? toothFairyGift.trim() : undefined,
        audioMemoKey,
        createdAt: existingEntry?.createdAt ?? now,
        updatedAt: now,
      };
      await putEntry(entry);
      if (!isExisting) playStarLight(soundsEnabled);
      onSaved();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!existingEntry) return;
    if (!confirm("Diesen Stern wieder erlöschen lassen? Foto, Notiz und Audio gehen mit.")) return;
    setSubmitting(true);
    try {
      await deleteEntry(existingEntry.id);
      onSaved();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const isExisting = Boolean(existingEntry);
  const ageString = profile.birthdate ? formatAge(profile.birthdate, date) : null;

  return (
    <div className="modal-veil" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card detail-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Schließen">
          ×
        </button>
        <p className="modal-kicker">{isExisting ? "Stern leuchtet" : "Neuer Stern"}</p>
        <h2 className="modal-title">{tooth.label}</h2>

        <form className="entry-form" onSubmit={handleSave}>
          <div className="photo-row">
            <PhotoSlot
              label="Wackelzahn"
              hint="vor dem Ausfall"
              state={beforeSlot}
              onChange={setBeforeSlot}
            />
            <PhotoSlot
              label="Lücke"
              hint="nach dem Ausfall"
              state={afterSlot}
              onChange={setAfterSlot}
            />
          </div>

          <div className="field">
            <label htmlFor="entry-date">Wann ist er rausgekommen?</label>
            <input
              id="entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={todayIso()}
              required
            />
            {ageString && <p className="field-hint">{ageString}</p>}
          </div>

          <div className="field">
            <label htmlFor="entry-note">Notiz</label>
            <textarea
              id="entry-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Wie war's? Wie ist er rausgekommen?"
              rows={4}
              maxLength={1000}
            />
          </div>

          <div className="field">
            <span className="field-label">Audio (optional)</span>
            <AudioMemo state={audioSlot} onChange={setAudioSlot} />
            <p className="field-hint">Ein paar Sekunden Stimme, Lachen, oder die Geschichte des Wackelzahns.</p>
          </div>

          {showFairyField ? (
            <div className="field">
              <label htmlFor="entry-fairy">Was hat die Zahnfee oder Maus gebracht?</label>
              <input
                id="entry-fairy"
                type="text"
                value={toothFairyGift}
                onChange={(e) => setToothFairyGift(e.target.value)}
                placeholder="z.B. einen Goldtaler"
                maxLength={120}
              />
              <button
                type="button"
                className="link-button"
                onClick={() => { setShowFairyField(false); setToothFairyGift(""); }}
              >
                Feld weglassen
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="link-button add-fairy"
              onClick={() => setShowFairyField(true)}
            >
              + Zahnfee / Zahnmaus dazu
            </button>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Abbrechen
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "..." : isExisting ? "Aktualisieren" : "Festhalten"}
            </button>
          </div>

          {isExisting && (
            <button
              type="button"
              className="btn btn-danger-ghost btn-block"
              onClick={handleDelete}
              disabled={submitting}
            >
              Stern erlöschen lassen
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function formatAge(birthdateIso: string, eventDateIso: string): string | null {
  const b = new Date(birthdateIso);
  const e = new Date(eventDateIso);
  if (isNaN(b.getTime()) || isNaN(e.getTime())) return null;
  if (e < b) return null;
  let years = e.getFullYear() - b.getFullYear();
  let months = e.getMonth() - b.getMonth();
  if (e.getDate() < b.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return null;
  const yearLabel = years === 1 ? "Jahr" : "Jahre";
  const monthLabel = months === 1 ? "Monat" : "Monate";
  if (years === 0) return `Mit ${months} ${monthLabel}.`;
  if (months === 0) return `Mit ${years} ${yearLabel}.`;
  return `Mit ${years} ${yearLabel} und ${months} ${monthLabel}.`;
}
