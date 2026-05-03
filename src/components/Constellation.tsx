import { useMemo } from "react";
import type { ToothEntry } from "../types";
import { TEETH } from "../lib/teeth";

interface Props {
  entries: ToothEntry[];
}

/**
 * Zarte Konstellations-Linien zwischen leuchtenden Sternen, in chronologischer
 * Reihenfolge der Eintraege. Mit jedem neuen Eintrag waechst die Linie.
 */
export function Constellation({ entries }: Props) {
  const segments = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const points = sorted
      .map((e) => TEETH.find((t) => t.id === e.toothId))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .map((t) => ({ x: t.x, y: t.y }));
    const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let i = 0; i < points.length - 1; i++) {
      segs.push({ x1: points[i].x, y1: points[i].y, x2: points[i + 1].x, y2: points[i + 1].y });
    }
    return segs;
  }, [entries]);

  return (
    <svg
      className="constellation"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {segments.map((s, idx) => (
        <line
          key={idx}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          className="constellation-line"
          style={{ animationDelay: `${idx * 0.15}s` }}
        />
      ))}
    </svg>
  );
}
