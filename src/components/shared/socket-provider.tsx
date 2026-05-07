import { useSocketInit } from "../../hooks/use-socket-init";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocketInit();
  return <>{children}</>;
}
