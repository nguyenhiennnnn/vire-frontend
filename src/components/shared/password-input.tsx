import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../../components/ui/input";

interface PasswordInputProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "type"
> {
  placeholder?: string;
}

export function PasswordInput({
  placeholder = "Mật khẩu",
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="pr-10"
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setShow((v) => !v)}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
