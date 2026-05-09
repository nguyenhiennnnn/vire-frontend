import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ColorSchemeId } from "../lib/color-schemes";

interface ThemeStore {
  colorScheme: ColorSchemeId;
  setColorScheme: (scheme: ColorSchemeId) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      colorScheme: "ember",
      setColorScheme: (colorScheme) => set({ colorScheme }),
    }),
    { name: "theme-color-scheme" },
  ),
);
