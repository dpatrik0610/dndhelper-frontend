import { createContext, type ReactNode } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { useSignalR } from "./hooks/useSignalR";

interface SignalRContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  connectionId?: string | null;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);
export { SignalRContext };

export function SignalRProvider({ children }: { children: ReactNode }) {
  const signalRState = useSignalR();

  return (
    <SignalRContext.Provider value={signalRState}>
      {children}
    </SignalRContext.Provider>
  );
}
