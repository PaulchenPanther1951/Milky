import { useEffect, useMemo, useState } from "react";
import type { Profile, ToothEntry } from "../types";
import { findTooth } from "../lib/teeth";
import { entryIdFor } from "../lib/use-entries";
import { savePhoto, deletePhoto, putEntry, deleteEntry } from "../lib/db";
import { PhotoSlot, type PhotoSlotState } from "./PhotoSlot";

interface Props {
  toothId: string | null;
  profile: Profile;
  existingEntry: ToothEntry | null;
  onClose: () => void;
  onSaved: () => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

function emptySlot(existingKey?: string): PhotoSlotState {
  return { existingKey, pendingBlob: null, removed: false };
}

export function StarDetail({ toothId, profile, existingEntry, onClose, onSaved }: Props) {
  const [date, setDate] = useState<string>(existingEntry?.date ?? todayIso());
  const [note, setNote] = useState<string>(existingEntry?.note ?? "");
  const [beforeSlot, setBeforeSlot] = useState<PhotoSlotState>(() =>
    emptySlot(existingEntry?.photoBeforeKey)
  );
  const [afterSlot, setAfterSlot] = useState<PhotoSlotState>(() =>
    emptySlot(existingEntry?.photoAfterKey)
  );
  const [submitting, setSubmitting] = useState(false);

  const tooth = useMemo(() => (toothId ? findTooth(toothId) : undefined), [toothId]);

  // Reset form when toothId changes
  useEffect(() => {
    if (!toothId) return;
    setDate(existingEntry?.date ?? todayIso());
    setNote(existingEntry?.note ?? "");
    setBeforeSlot(emptySlot(existingEntry?.photoBeforeKey));
    setAfterSlot(emptySlot(existingEntry?.photoAfterKey));
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const photoBeforeKey = await resolvePhotoKey(beforeSlot);
      const photoAfterKey = await resolvePhotoKey(afterSlot);
      const now = new Date().toISOString();
      const entry: ToothEntry = {
        id: existingEntry?.id ?? entryIdFor(profile.id, tooth!.id),
        profileId: profile.id,
        toothId: tooth!.id,
        date,
        note: note.trim(),
        photoBeforeKey,
        photoAfterKey,
        toothFairyGift: existingEntry?.toothFairyGift,
        audioMemoKey: existingEntry?.audioMemoKey,
        createdAt: existingEntry?.createdAt ?? now,
        updatedAt: now,
      };
      await putEntry(entry);
      onSaved();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!existingEntry) return;
    if (!confirm("Diesen Stern wieder erlöschen lassen? Foto und Notiz gehen mit.")) return;
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
