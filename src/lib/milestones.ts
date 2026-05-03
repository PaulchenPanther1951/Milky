import type { ToothEntry } from "../types";

export interface Milestone {
  id: string;
  name: string;
  description: string;
  /** Predicate over current entries */
  satisfied: (entries: ToothEntry[]) => boolean;
}

export const MILESTONES: Milestone[] = [
  {
    id: "first-tooth",
    name: "Der erste Stern",
    description: "Der erste Milchzahn ist raus. Eine kleine Galaxie hat angefangen zu leuchten.",
    satisfied: (entries) => entries.length >= 1,
  },
  {
    id: "first-upper",
    name: "Erster oberer Stern",
    description:
      "Auch oben hat der erste Zahn den Weg ins Sternenfeld gefunden. Die obere Reihe wacht jetzt auch.",
    satisfied: (entries) => entries.some((e) => e.toothId.startsWith("u-")),
  },
  {
    id: "five-stars",
    name: "Fünf Sterne",
    description: "Fünf Zähne sind dokumentiert. Ein Viertel der Galaxie steht.",
    satisfied: (entries) => entries.length >= 5,
  },
  {
    id: "ten-stars",
    name: "Halbzeit",
    description: "Zehn Zähne — die halbe Galaxie ist da.",
    satisfied: (entries) => entries.length >= 10,
  },
  {
    id: "fifteen-stars",
    name: "Drei Viertel",
    description: "Fünfzehn Zähne — die Konstellation wird langsam komplett.",
    satisfied: (entries) => entries.length >= 15,
  },
  {
    id: "all-twenty",
    name: "Galaxie komplett",
    description:
      "Alle zwanzig Milchzähne sind dokumentiert. Eine ganze kleine Welt — bewahrt für später.",
    satisfied: (entries) => entries.length >= 20,
  },
];

export function computeAchieved(entries: ToothEntry[]): string[] {
  return MILESTONES.filter((m) => m.satisfied(entries)).map((m) => m.id);
}

export function findMilestone(id: string): Milestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}
