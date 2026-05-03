import { useEffect } from "react";
import { findTooth } from "../lib/teeth";

interface Props {
  toothId: string | null;
  onClose: () => void;
}

/**
 * Platzhalter-Modal. Echte Detail-Ansicht (Foto + Diary) kommt in Schritt 4.
 */
export function StarDetailPlaceholder({ toothId, onClose }: Props) {
  useEffect(() => {
    if (!toothId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [toothId, onClose]);

  if (!toothId) return null;
  const tooth = findTooth(toothId);
  if (!tooth) return null;

  return (
    <div className="modal-veil" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Schließen"
        >
          ×
        </button>
        <p className="modal-kicker">Stern {tooth.id}</p>
        <h2 className="modal-title">{tooth.label}</h2>
        <p className="modal-text">
          Hier wird ab Schritt 4 das Tagebuch fuer diesen Zahn liegen — Datum, Foto vorher,
          Foto nachher, eine kleine Notiz.
        </p>
        <p className="modal-hint">Tippe auf das X oder neben die Karte zum Schließen.</p>
      </div>
    </div>
  );
}
