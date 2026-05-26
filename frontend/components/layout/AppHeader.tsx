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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8">
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
        <div className="hidden max-w-md items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground sm:flex">
          <Search className="h-4 w-4" aria-hidden="true" />
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
        onClick={() => toast.info(translate("showNotifications"))}
        size="icon"
        type="button"
        variant="outline"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
      </Button>

      {currentUser ? (
        <div className="hidden items-center gap-3 border-l border-border pl-3 md:flex">
          <div className="flex items-center gap-2">
            {currentUser.avatarUrl ? (
              <span
                aria-label={currentUser.fullName}
                className="h-9 w-9 rounded-md border border-border object-cover"
                role="img"
                style={{
                  backgroundImage: `url(${currentUser.avatarUrl})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
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
          <Badge variant="outline">{currentUser.role}</Badge>
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
