import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";

interface Props {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const GuestRoute = ({ children }: Props) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
};
