"use client";

import { FileText, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { NavigationItem } from "@/types/navigation";

type AppSidebarProps = {
  isMobileOpen: boolean;
  navigationItems: NavigationItem[];
  onClose: () => void;
};

export function AppSidebar({ isMobileOpen, navigationItems, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 transition-opacity lg:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link className="flex items-center gap-3" href="/" onClick={onClose}>
            <span className="rounded-md bg-primary p-2 text-primary-foreground">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">AADPP</span>
              <span className="block text-xs text-muted-foreground">Accounting AI Platform</span>
            </span>
          </Link>
          <Button
            aria-label="Close navigation"
            className="lg:hidden"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigationItems.map((navigationItem) => {
            const NavigationIcon = navigationItem.icon;
            const isActive = pathname === navigationItem.href;

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                href={navigationItem.href}
                key={navigationItem.label}
                onClick={onClose}
              >
                <NavigationIcon className="h-4 w-4" aria-hidden="true" />
                {navigationItem.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Environment</p>
          <p className="mt-1 text-sm text-foreground">Development foundation</p>
        </div>
      </aside>
    </>
  );
}
