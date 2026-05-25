"use client";

import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";

type GlobalLoadingContextValue = {
  isGlobalLoading: boolean;
  startGlobalLoading: () => void;
  stopGlobalLoading: () => void;
};

export const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);

type GlobalLoadingProviderProps = {
  children: ReactNode;
};

export function GlobalLoadingProvider({ children }: GlobalLoadingProviderProps) {
  const [activeRequestCount, setActiveRequestCount] = useState(0);

  const startGlobalLoading = useCallback(() => {
    setActiveRequestCount((requestCount) => requestCount + 1);
  }, []);

  const stopGlobalLoading = useCallback(() => {
    setActiveRequestCount((requestCount) => Math.max(0, requestCount - 1));
  }, []);

  const globalLoadingContextValue = useMemo<GlobalLoadingContextValue>(
    () => ({
      isGlobalLoading: activeRequestCount > 0,
      startGlobalLoading,
      stopGlobalLoading,
    }),
    [activeRequestCount, startGlobalLoading, stopGlobalLoading],
  );

  return (
    <GlobalLoadingContext.Provider value={globalLoadingContextValue}>
      {children}
    </GlobalLoadingContext.Provider>
  );
}
