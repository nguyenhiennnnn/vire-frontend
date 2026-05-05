import { Button } from "../ui/button";

const BACKEND_URL = import.meta.env.VITE_API_URL as string;

export function GoogleButton({
  label = "Tiếp tục với Google",
}: {
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={() => window.location.assign(`${BACKEND_URL}/auth/google`)}
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.6 1 24 1 14.8 1 6.9 6.6 3.4 14.6l7 5.4C12.1 13.5 17.6 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.4 37.3 46.5 31.3 46.5 24.5z"
        />
        <path
          fill="#FBBC05"
          d="M10.4 28.6A14.7 14.7 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7-5.4A23.8 23.8 0 0 0 .5 24c0 3.8.9 7.4 2.5 10.6l7.4-6z"
        />
        <path
          fill="#34A853"
          d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7.5-5.8c-1.9 1.3-4.4 2.2-6 2.2-6.4 0-11.9-4-13.6-9.9l-7.4 6C6.9 41.4 14.8 47 24 47z"
        />
      </svg>
      {label}
    </Button>
  );
}
