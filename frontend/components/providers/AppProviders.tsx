"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { GlobalLoadingProvider } from "@/components/providers/GlobalLoadingProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <GlobalLoadingProvider>
          {children}
          <ToastProvider />
        </GlobalLoadingProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
