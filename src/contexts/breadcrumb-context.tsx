// src/contexts/breadcrumb-context.tsx
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface BreadcrumbContextType {
  customTitles: Record<string, string>;
  setCustomTitle: (path: string, title: string) => void;
  clearCustomTitle: (path: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function useBreadcrumbContext() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbContext must be used within a BreadcrumbProvider');
  }
  return context;
}

interface BreadcrumbProviderProps {
  children: ReactNode;
}

export function BreadcrumbProvider({ children }: BreadcrumbProviderProps) {
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({});

  const setCustomTitle = (path: string, title: string) => {
    setCustomTitles(prev => ({ ...prev, [path]: title }));
  };

  const clearCustomTitle = (path: string) => {
    setCustomTitles(prev => {
      const { [path]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <BreadcrumbContext.Provider value={{ customTitles, setCustomTitle, clearCustomTitle }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

// Hook to set custom breadcrumb title for current page
export function useBreadcrumbTitle(title: string) {
  const { setCustomTitle, clearCustomTitle } = useBreadcrumbContext();
  const currentPath = window.location.pathname;

  React.useEffect(() => {
    setCustomTitle(currentPath, title);
    return () => clearCustomTitle(currentPath);
  }, [title, currentPath, setCustomTitle, clearCustomTitle]);
}