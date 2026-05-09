import { useEffect } from "react";
import { useThemeStore } from "../stores/theme-store";

export function ColorSchemeApplier() {
  const { colorScheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-scheme", colorScheme);
  }, [colorScheme]);

  return null;
}
