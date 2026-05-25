"use client";

import { useState, type ReactNode } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DASHBOARD_NAVIGATION_ITEMS } from "@/constants/routes";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        isMobileOpen={isSidebarOpen}
        navigationItems={DASHBOARD_NAVIGATION_ITEMS}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="lg:pl-72">
        <AppHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
