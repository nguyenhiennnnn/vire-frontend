import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import api from "../../services/api";
import type { User } from "../../types";

const readAndClearCookie = (name: string): string | null => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  document.cookie = `${name}=; Max-Age=0; path=/`;
  return value;
};

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { login, setAccessToken } = useAuth();

  useEffect(() => {
    const token = readAndClearCookie("oauthToken");
    if (!token) {
      navigate("/login?error=google", { replace: true });
      return;
    }

    setAccessToken(token);

    api
      .get<{ user: User }>("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        login(res.data.user, token);
        navigate("/feed", { replace: true });
      })
      .catch(() => navigate("/login?error=google", { replace: true }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );
}
