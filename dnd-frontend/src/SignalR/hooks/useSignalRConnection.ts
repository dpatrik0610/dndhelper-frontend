import { useContext } from "react";
import { SignalRContext } from "../SignalRProvider";

export function useSignalRConnection() {
  const ctx = useContext(SignalRContext);
  if (!ctx) {
    throw new Error("useSignalRConnection must be used inside <SignalRProvider>");
  }
  return ctx;
}
