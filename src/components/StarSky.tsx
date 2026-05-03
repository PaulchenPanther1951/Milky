import { TEETH } from "../lib/teeth";
import { Star } from "./Star";

interface StarSkyProps {
  litToothIds: Set<string>;
  onSelect: (id: string) => void;
}

/**
 * Container fuer alle 20 Sterne. Positioniert prozentual relativ zur eigenen Box.
 */
export function StarSky({ litToothIds, onSelect }: StarSkyProps) {
  return (
    <div className="star-sky" role="group" aria-label="Sternenkarte der Milchzaehne">
      <div className="jaw-divider" aria-hidden="true">
        <span className="jaw-label upper">Oben</span>
        <span className="jaw-label lower">Unten</span>
      </div>
      {TEETH.map((tooth) => (
        <Star
          key={tooth.id}
          tooth={tooth}
          lit={litToothIds.has(tooth.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
