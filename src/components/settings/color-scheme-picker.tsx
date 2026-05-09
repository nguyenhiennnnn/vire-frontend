import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { COLOR_SCHEMES } from "../../lib/color-schemes";
import { useThemeStore } from "../../stores/theme-store";

export function ColorSchemePicker() {
  const { colorScheme, setColorScheme } = useThemeStore();

  return (
    <div className="flex gap-5 flex-wrap">
      {COLOR_SCHEMES.map((scheme) => {
        const active = colorScheme === scheme.id;
        return (
          <div key={scheme.id} className="flex flex-col items-center gap-1.5">
            <button
              title={scheme.label}
              onClick={() => setColorScheme(scheme.id)}
              className={cn(
                "relative w-9 h-9 rounded-full transition-all duration-200",
                active ? "scale-110" : "hover:scale-105 hover:brightness-110",
              )}
              style={{
                backgroundColor: scheme.color,
                outline: active ? `2px solid ${scheme.color}` : "none",
                outlineOffset: "3px",
              }}
            >
              {active && (
                <Check
                  size={14}
                  strokeWidth={3}
                  className="absolute inset-0 m-auto text-white drop-shadow-sm"
                />
              )}
            </button>
            <span className="text-[10px] text-muted-foreground">
              {scheme.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
