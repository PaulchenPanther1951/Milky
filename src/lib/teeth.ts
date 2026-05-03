import type { ToothPosition } from "../types";

const typeByPos = {
  1: "incisor-central",
  2: "incisor-lateral",
  3: "canine",
  4: "molar-1",
  5: "molar-2",
} as const;

const labelMap: Record<string, string> = {
  "u-L1": "Oberer Schneidezahn links (mittig)",
  "u-L2": "Oberer Schneidezahn links (außen)",
  "u-L3": "Oberer Eckzahn links",
  "u-L4": "Oberer Backenzahn links (vorne)",
  "u-L5": "Oberer Backenzahn links (hinten)",
  "u-R1": "Oberer Schneidezahn rechts (mittig)",
  "u-R2": "Oberer Schneidezahn rechts (außen)",
  "u-R3": "Oberer Eckzahn rechts",
  "u-R4": "Oberer Backenzahn rechts (vorne)",
  "u-R5": "Oberer Backenzahn rechts (hinten)",
  "l-L1": "Unterer Schneidezahn links (mittig)",
  "l-L2": "Unterer Schneidezahn links (außen)",
  "l-L3": "Unterer Eckzahn links",
  "l-L4": "Unterer Backenzahn links (vorne)",
  "l-L5": "Unterer Backenzahn links (hinten)",
  "l-R1": "Unterer Schneidezahn rechts (mittig)",
  "l-R2": "Unterer Schneidezahn rechts (außen)",
  "l-R3": "Unterer Eckzahn rechts",
  "l-R4": "Unterer Backenzahn rechts (vorne)",
  "l-R5": "Unterer Backenzahn rechts (hinten)",
};

/**
 * 20 Milchzaehne, anatomisch arrangiert auf einer ruhigen Smile-Arc.
 * Koordinaten sind Prozente eines konstellations-containers — leicht nach oben/unten
 * verschoben fuer eine offene-Mund-Andeutung, keine klinische Praezision.
 */
export const TEETH: ToothPosition[] = [
  // Oberkiefer (sanfter Bogen, Mitte etwas tiefer angesetzt)
  buildTooth("u", "L", 5, 10, 38),
  buildTooth("u", "L", 4, 19, 32),
  buildTooth("u", "L", 3, 28, 27),
  buildTooth("u", "L", 2, 37, 24),
  buildTooth("u", "L", 1, 45.5, 22),
  buildTooth("u", "R", 1, 54.5, 22),
  buildTooth("u", "R", 2, 63, 24),
  buildTooth("u", "R", 3, 72, 27),
  buildTooth("u", "R", 4, 81, 32),
  buildTooth("u", "R", 5, 90, 38),

  // Unterkiefer (gespiegelter Bogen)
  buildTooth("l", "L", 5, 10, 62),
  buildTooth("l", "L", 4, 19, 68),
  buildTooth("l", "L", 3, 28, 73),
  buildTooth("l", "L", 2, 37, 76),
  buildTooth("l", "L", 1, 45.5, 78),
  buildTooth("l", "R", 1, 54.5, 78),
  buildTooth("l", "R", 2, 63, 76),
  buildTooth("l", "R", 3, 72, 73),
  buildTooth("l", "R", 4, 81, 68),
  buildTooth("l", "R", 5, 90, 62),
];

function buildTooth(
  jawCode: "u" | "l",
  sideCode: "L" | "R",
  pos: 1 | 2 | 3 | 4 | 5,
  x: number,
  y: number
): ToothPosition {
  const id = `${jawCode}-${sideCode}${pos}`;
  return {
    id,
    jaw: jawCode === "u" ? "upper" : "lower",
    side: sideCode === "L" ? "left" : "right",
    pos,
    type: typeByPos[pos],
    label: labelMap[id],
    x,
    y,
  };
}

export function findTooth(id: string): ToothPosition | undefined {
  return TEETH.find((t) => t.id === id);
}
