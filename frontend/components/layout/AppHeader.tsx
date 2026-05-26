"use client";

import { Bell, Loader2, LogOut, Menu, Search } from "lucide-react";
import { toast } from "sonner";

import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { useLanguage } from "@/hooks/useLanguage";

type AppHeaderProps = {
  onOpenSidebar: () => void;
};

export function AppHeader({ onOpenSidebar }: AppHeaderProps) {
  const { currentUser, signOut } = useAuth();
  const { isGlobalLoading } = useGlobalLoading();
  const { translate } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-[4.5rem] items-center gap-3 border-b border-white/70 bg-white/78 px-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-6 lg:px-8">
      <Button
        aria-label={translate("openNavigation")}
        className="lg:hidden"
        onClick={onOpenSidebar}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <div className="min-w-0 flex-1">
        <div className="input-surface hidden h-11 max-w-xl items-center gap-3 rounded-md px-4 text-sm text-muted-foreground sm:flex">
          <Search className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{translate("searchPlaceholder")}</span>
        </div>
      </div>

      {isGlobalLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {translate("syncing")}
        </div>
      ) : null}

      <LanguageToggle />

      <Button
        aria-label={translate("showNotifications")}
        className="bg-white/80"
        onClick={() => toast.info(translate("showNotifications"))}
        size="icon"
        type="button"
        variant="outline"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
      </Button>

      {currentUser ? (
        <div className="hidden items-center gap-3 rounded-md border border-border/70 bg-white/76 px-2.5 py-1.5 shadow-sm md:flex">
          <div className="flex items-center gap-2">
            {currentUser.avatarUrl ? (
              <span
                aria-label={currentUser.fullName}
                className="h-9 w-9 rounded-md border border-white object-cover shadow-sm ring-2 ring-primary/10"
                role="img"
                style={{
                  backgroundImage: `url(${currentUser.avatarUrl})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
            ) : (
              <span className="gradient-primary flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold text-primary-foreground shadow-sm">
                {currentUser.fullName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="block max-w-40 truncate text-sm font-medium text-foreground">
                {currentUser.fullName}
              </span>
              <span className="block text-xs text-muted-foreground">{currentUser.email}</span>
            </span>
          </div>
          <Badge className="font-mono" variant="outline">{currentUser.role}</Badge>
          <Button
            aria-label={translate("logOut")}
            onClick={() => {
              void signOut();
            }}
            size="icon"
            type="button"
            variant="ghost"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </header>
  );
}
