"use client";

import { useState, type ReactNode } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { DASHBOARD_NAVIGATION_ITEMS } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  const visibleNavigationItems = DASHBOARD_NAVIGATION_ITEMS.filter((navigationItem) => {
    if (!navigationItem.allowedRoles) {
      return true;
    }

    return currentUser ? navigationItem.allowedRoles.includes(currentUser.role) : false;
  });

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        isMobileOpen={isSidebarOpen}
        navigationItems={visibleNavigationItems}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="lg:pl-72">
        <AppHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">
          <AnimatedContainer>{children}</AnimatedContainer>
        </main>
      </div>
    </div>
  );
}
