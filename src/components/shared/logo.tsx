import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link to="/">
      <img src="/assets/vire-logo.svg" alt="Logo" className="h-8 shrink-0" />
    </Link>
  );
};
