"use client";

import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";

import { LOCAL_STORAGE_ACCESS_TOKEN_KEY } from "@/constants/app";
import type { AuthSession, AuthenticatedUser } from "@/types/auth";

type AuthContextValue = {
  currentUser: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  signIn: (authSession: AuthSession) => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
  });
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);

  const signIn = useCallback((authSession: AuthSession) => {
    window.localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, authSession.accessToken);
    setAccessToken(authSession.accessToken);
    setCurrentUser(authSession.currentUser);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    setAccessToken(null);
    setCurrentUser(null);
  }, []);

  const authContextValue = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      signIn,
      signOut,
    }),
    [accessToken, currentUser, signIn, signOut],
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}
