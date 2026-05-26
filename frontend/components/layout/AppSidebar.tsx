"use client";

import { FileText, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/cn";
import type { NavigationItem } from "@/types/navigation";

type AppSidebarProps = {
  isMobileOpen: boolean;
  navigationItems: NavigationItem[];
  onClose: () => void;
};

export function AppSidebar({ isMobileOpen, navigationItems, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { translate } = useLanguage();
  const primaryNavigationItems = navigationItems.filter(
    (navigationItem) => !navigationItem.allowedRoles,
  );
  const adminNavigationItems = navigationItems.filter(
    (navigationItem) => navigationItem.allowedRoles?.includes("ADMIN"),
  );
  const activeNavigationHref = navigationItems
    .filter(
      (navigationItem) =>
        pathname === navigationItem.href ||
        (navigationItem.href !== "/" && pathname.startsWith(`${navigationItem.href}/`)),
    )
    .sort((firstItem, secondItem) => secondItem.href.length - firstItem.href.length)[0]?.href;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity lg:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[4.5rem] items-center justify-between border-b border-white/10 px-5">
          <Link className="flex items-center gap-3" href="/" onClick={onClose}>
            <span className="gradient-primary rounded-md p-2 text-primary-foreground shadow-lg shadow-blue-500/25">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold text-white">AADPP</span>
              <span className="block text-xs text-slate-400">
                {translate("accountingAiPlatform")}
              </span>
            </span>
          </Link>
          <Button
            aria-label={translate("closeNavigation")}
            className="lg:hidden"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <nav className="flex-1 space-y-6 px-3 py-5">
          <NavigationGroup
            activeNavigationHref={activeNavigationHref}
            navigationItems={primaryNavigationItems}
            onClose={onClose}
            translate={translate}
          />

          {adminNavigationItems.length > 0 ? (
            <div className="border-t border-white/10 pt-5">
              <p className="px-3 font-mono text-[0.68rem] font-bold uppercase text-slate-500">
                Admin
              </p>
              <NavigationGroup
                activeNavigationHref={activeNavigationHref}
                className="mt-3"
                navigationItems={adminNavigationItems}
                onClose={onClose}
                translate={translate}
              />
            </div>
          ) : null}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="font-mono text-xs font-bold uppercase text-slate-500">
            {translate("environment")}
          </p>
          <p className="mt-1 text-sm text-slate-300">{translate("developmentFoundation")}</p>
        </div>
      </aside>
    </>
  );
}

type NavigationGroupProps = {
  activeNavigationHref?: string;
  className?: string;
  navigationItems: NavigationItem[];
  onClose: () => void;
  translate: (translationKey: NonNullable<NavigationItem["translationKey"]>) => string;
};

function NavigationGroup({
  activeNavigationHref,
  className,
  navigationItems,
  onClose,
  translate,
}: NavigationGroupProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {navigationItems.map((navigationItem) => {
        const NavigationIcon = navigationItem.icon;
        const isActive = activeNavigationHref === navigationItem.href;
        const navigationLabel = navigationItem.translationKey
          ? translate(navigationItem.translationKey) || navigationItem.label
          : navigationItem.label;

        return (
          <Link
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all duration-200",
              isActive
                ? "gradient-primary text-white shadow-lg shadow-blue-500/25"
                : "text-slate-400 hover:bg-white/10 hover:text-white",
            )}
            href={navigationItem.href}
            key={navigationItem.label}
            onClick={onClose}
          >
            {isActive ? (
              <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white/80" />
            ) : null}
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                isActive ? "bg-white/15 text-white" : "bg-white/5 text-slate-400 group-hover:text-white",
              )}
            >
              <NavigationIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 truncate text-left">{navigationLabel}</span>
          </Link>
        );
      })}
    </div>
  );
}
