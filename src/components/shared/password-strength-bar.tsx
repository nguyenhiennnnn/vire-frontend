import {
  getPasswordStrength,
  PASSWORD_STRENGTH_COLOR,
  PASSWORD_STRENGTH_LABEL,
} from "../../lib/utils";

const WIDTH_MAP = { weak: "33%", medium: "66%", strong: "100%" } as const;

interface PasswordStrengthBarProps {
  password: string;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  if (!password) return null;
  const strength = getPasswordStrength(password);
  if (!strength) return null;

  return (
    <div className="space-y-1 pt-0.5">
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${PASSWORD_STRENGTH_COLOR[strength]}`}
          style={{ width: WIDTH_MAP[strength] }}
        />
      </div>
      <p
        className={`text-xs font-medium ${
          strength === "strong"
            ? "text-green-600"
            : strength === "medium"
              ? "text-amber-600"
              : "text-destructive"
        }`}
      >
        {PASSWORD_STRENGTH_LABEL[strength]}
      </p>
    </div>
  );
}
