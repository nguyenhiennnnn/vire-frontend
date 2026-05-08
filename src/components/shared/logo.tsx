import { Link } from "react-router-dom";
import { useTheme } from "../theme-context";

export const Logo = () => {
  const { theme } = useTheme();

  return (
    <Link to="/">
      <img
        src={
          theme === "dark"
            ? "/assets/vire-logo-dark.svg"
            : "/assets/vire-logo-light.svg"
        }
        alt="Vire"
        className="h-8 shrink-0"
      />
    </Link>
  );
};
