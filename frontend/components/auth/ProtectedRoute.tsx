"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
  children: ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const router = useRouter();
  const { accessToken, currentUser, hasRole, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !accessToken) {
      router.replace(ROUTES.login);
    }
  }, [accessToken, isAuthLoading, router]);

  if (isAuthLoading || !accessToken || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">Access denied</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your account does not have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
