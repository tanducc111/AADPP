"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { GlobalLoadingProvider } from "@/components/providers/GlobalLoadingProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <GlobalLoadingProvider>
        {children}
        <ToastProvider />
      </GlobalLoadingProvider>
    </AuthProvider>
  );
}
