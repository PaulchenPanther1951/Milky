import { useEffect } from "react";
import { findMilestone } from "../lib/milestones";
import { useSettings } from "../lib/settings-context";
import { playMilestone } from "../lib/sound";

interface Props {
  milestoneId: string;
  onDismiss: () => void;
}

export function MilestoneCelebration({ milestoneId, onDismiss }: Props) {
  const milestone = findMilestone(milestoneId);
  const { soundsEnabled } = useSettings();

  useEffect(() => {
    if (!milestone) return;
    playMilestone(soundsEnabled);
  }, [milestone, soundsEnabled]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onDismiss]);

  if (!milestone) return null;

  return (
    <div className="modal-veil milestone-veil" role="dialog" aria-modal="true" aria-label="Meilenstein erreicht">
      <div className="shooting-star" aria-hidden="true">
        <span className="shooting-star-trail" />
        <span className="shooting-star-head" />
      </div>
      <div className="modal-card milestone-card" onClick={(e) => e.stopPropagation()}>
        <p className="modal-kicker milestone-kicker">Meilenstein</p>
        <h2 className="modal-title milestone-title">{milestone.name}</h2>
        <p className="milestone-desc">{milestone.description}</p>
        <button type="button" className="btn btn-primary btn-block" onClick={onDismiss}>
          Weiter
        </button>
      </div>
    </div>
  );
}
