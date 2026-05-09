export type ColorSchemeId =
  | "ember"
  | "ocean"
  | "forest"
  | "rose"
  | "violet"
  | "gold"
  | "mint"
  | "coral"
  | "indigo"
  | "plum"
  | "lime";

export interface ColorScheme {
  id: ColorSchemeId;
  label: string;
  color: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  { id: "ember", label: "Ember", color: "oklch(0.58 0.21 38)" },
  { id: "coral", label: "Coral", color: "oklch(0.60 0.20 22)" },
  { id: "rose", label: "Rose", color: "oklch(0.56 0.22 355)" },
  { id: "violet", label: "Violet", color: "oklch(0.54 0.22 275)" },
  { id: "ocean", label: "Ocean", color: "oklch(0.52 0.20 215)" },
  { id: "mint", label: "Mint", color: "oklch(0.52 0.17 175)" },
  { id: "forest", label: "Forest", color: "oklch(0.50 0.18 148)" },
  { id: "gold", label: "Gold", color: "oklch(0.58 0.18 72)" },
  { id: "indigo", label: "Indigo", color: "oklch(0.52 0.22 240)" },
  { id: "plum", label: "Plum", color: "oklch(0.54 0.22 315)" },
  { id: "lime", label: "Lime", color: "oklch(0.55 0.18 115)" },
];
