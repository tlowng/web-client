// src/contexts/breadcrumb-context.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
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

  const setCustomTitle = useCallback((path: string, title: string) => {
    setCustomTitles(prev => {
      // Only update if the title is different
      if (prev[path] === title) return prev;
      return { ...prev, [path]: title };
    });
  }, []);

  const clearCustomTitle = useCallback((path: string) => {
    setCustomTitles(prev => {
      if (!(path in prev)) return prev;
      const { [path]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const contextValue = React.useMemo(() => ({
    customTitles,
    setCustomTitle,
    clearCustomTitle
  }), [customTitles, setCustomTitle, clearCustomTitle]);

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

// Hook to set custom breadcrumb title for current page
export function useBreadcrumbTitle(title: string) {
  const { setCustomTitle, clearCustomTitle } = useBreadcrumbContext();
  const currentPath = window.location.pathname;

  React.useEffect(() => {
    if (title) {
      setCustomTitle(currentPath, title);
    }
    
    return () => {
      if (title) {
        clearCustomTitle(currentPath);
      }
    };
  }, [title, currentPath, setCustomTitle, clearCustomTitle]);
}