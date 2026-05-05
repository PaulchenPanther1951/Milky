import type { ToothPosition } from "../types";

interface StarProps {
  tooth: ToothPosition;
  lit: boolean;
  bursting?: boolean;
  onSelect: (id: string) => void;
}

/**
 * Ein einzelner Stern in der Konstellation.
 * "lit" = der Zahn ist dokumentiert und der Stern leuchtet.
 * "dim" = der Zahn ist noch da, der Stern wartet.
 * "bursting" = wurde gerade neu dokumentiert, spielt eine einmalige Strahlen-Animation.
 */
export function Star({ tooth, lit, bursting, onSelect }: StarProps) {
  const sizeByType: Record<string, number> = {
    "incisor-central": 14,
    "incisor-lateral": 13,
    "canine": 16,
    "molar-1": 18,
    "molar-2": 20,
  };
  const baseSize = sizeByType[tooth.type] ?? 14;

  return (
    <button
      type="button"
      className={`star ${lit ? "lit" : "dim"}${bursting ? " bursting" : ""}`}
      style={{
        left: `${tooth.x}%`,
        top: `${tooth.y}%`,
        width: `${baseSize}px`,
        height: `${baseSize}px`,
        animationDelay: `${(tooth.pos + (tooth.jaw === "upper" ? 0 : 5)) * 0.4}s`,
      }}
      aria-label={`${tooth.label}${lit ? " — dokumentiert" : " — noch da"}`}
      onClick={() => onSelect(tooth.id)}
    >
      <span className="star-glow" aria-hidden="true" />
      <span className="star-core" aria-hidden="true" />
      {bursting && <span className="star-burst" aria-hidden="true" />}
    </button>
  );
}
