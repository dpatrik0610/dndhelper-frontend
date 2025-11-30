import { createContext, useContext, type ReactNode } from 'react';
import { HubConnection } from '@microsoft/signalr';

interface SignalRContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  connectionId?: string;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider = ({ 
  children, 
  value 
}: { 
  children: ReactNode; 
  value: SignalRContextType 
}) => {
  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

// Hook to use SignalR connection anywhere in your app
export const useSignalRConnection = () => {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error('useSignalRConnection must be used within SignalRProvider');
  }
  return context;
};