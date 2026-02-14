import React, { createContext, useContext, useState } from 'react';

interface AppContextValue {
  selectedRepositoryId: string | null;
  setSelectedRepositoryId: (id: string | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | null>(null);

  return (
    <AppContext.Provider value={{ selectedRepositoryId, setSelectedRepositoryId }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
