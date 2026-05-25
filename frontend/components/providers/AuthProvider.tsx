"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { getCurrentUserProfile, logoutAuthenticatedUser } from "@/services/authService";
import type { AuthSession, AuthenticatedUser, UserRole } from "@/types/auth";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from "@/utils/authStorage";

type AuthContextValue = {
  currentUser: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  signIn: (authSession: AuthSession) => void;
  signOut: () => Promise<void>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredAccessToken());
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(() => Boolean(getStoredAccessToken()));

  const clearAuthState = useCallback(() => {
    clearStoredAccessToken();
    setAccessToken(null);
    setCurrentUser(null);
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    if (!accessToken || currentUser) {
      return;
    }

    let shouldUpdateState = true;

    async function loadCurrentUser() {
      try {
        const authenticatedUser = await getCurrentUserProfile();

        if (shouldUpdateState) {
          setCurrentUser(authenticatedUser);
        }
      } catch {
        if (shouldUpdateState) {
          clearAuthState();
        }
      } finally {
        if (shouldUpdateState) {
          setIsAuthLoading(false);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      shouldUpdateState = false;
    };
  }, [accessToken, clearAuthState, currentUser]);

  const signIn = useCallback((authSession: AuthSession) => {
    setStoredAccessToken(authSession.accessToken);
    setAccessToken(authSession.accessToken);
    setCurrentUser(authSession.currentUser);
    setIsAuthLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (accessToken) {
        await logoutAuthenticatedUser();
      }
    } finally {
      clearAuthState();
      window.location.assign(ROUTES.login);
    }
  }, [accessToken, clearAuthState]);

  const hasRole = useCallback(
    (allowedRoles: UserRole[]) => {
      if (!currentUser) {
        return false;
      }

      return allowedRoles.includes(currentUser.role);
    },
    [currentUser],
  );

  const authContextValue = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      accessToken,
      isAuthenticated: Boolean(accessToken && currentUser),
      isAuthLoading,
      signIn,
      signOut,
      hasRole,
    }),
    [accessToken, currentUser, hasRole, isAuthLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}
