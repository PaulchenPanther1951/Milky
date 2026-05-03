export type Jaw = "upper" | "lower";
export type Side = "left" | "right";
export type ToothType = "incisor-central" | "incisor-lateral" | "canine" | "molar-1" | "molar-2";

export interface ToothPosition {
  /** Stable id, e.g. "u-L1" = upper-left central incisor */
  id: string;
  jaw: Jaw;
  side: Side;
  /** 1 (most central) to 5 (most distal molar) */
  pos: 1 | 2 | 3 | 4 | 5;
  type: ToothType;
  /** Friendly German label for accessibility / detail view */
  label: string;
  /** Position on the sky as percentage of constellation container */
  x: number;
  y: number;
}

export type ThemeKey = "galaxie" | "korallenriff" | "drachenwald" | "wolkenreich";

export interface Profile {
  id: string;
  name: string;
  /** ISO date or null if not set */
  birthdate: string | null;
  /** Avatar photo as Blob, stored separately under photo key */
  photoKey?: string;
  theme: ThemeKey;
  createdAt: string;
  /**
   * Milestone IDs that have already been celebrated for this profile.
   * undefined = never tracked (silent baseline on next entries refresh).
   * empty array = baseline established, no celebrations yet.
   */
  celebratedMilestones?: string[];
}

export interface ToothEntry {
  /** Composite key: profileId + toothId */
  id: string;
  profileId: string;
  toothId: string;
  /** ISO date when the tooth fell out */
  date: string;
  /** Diary text */
  note: string;
  /** Photo blob keys */
  photoBeforeKey?: string;
  photoAfterKey?: string;
  /** Optional fields, added in Schritt 5 */
  toothFairyGift?: string;
  audioMemoKey?: string;
  createdAt: string;
  updatedAt: string;
}
