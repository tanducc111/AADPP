"use client";

import { Bell, Loader2, Menu, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";

type AppHeaderProps = {
  onOpenSidebar: () => void;
};

export function AppHeader({ onOpenSidebar }: AppHeaderProps) {
  const { isGlobalLoading } = useGlobalLoading();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button
        aria-label="Open navigation"
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
          <span>Search documents, companies, or audit events</span>
        </div>
      </div>

      {isGlobalLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Syncing
        </div>
      ) : null}

      <Button
        aria-label="Show notifications"
        onClick={() => toast.info("Notifications are ready for future workflows.")}
        size="icon"
        type="button"
        variant="outline"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
      </Button>
    </header>
  );
}
