import { useBootstrap } from "../../hooks/use-bootstrap";

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { isReady } = useBootstrap();

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
