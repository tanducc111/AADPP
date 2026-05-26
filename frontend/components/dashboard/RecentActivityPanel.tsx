"use client";

import { Activity, History } from "lucide-react";

import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/hooks/useLanguage";
import type { ActivityLog } from "@/types/dashboard";
import { formatDateTime } from "@/utils/formatDate";

type RecentActivityPanelProps = {
  recentActivities: ActivityLog[];
};

export function RecentActivityPanel({ recentActivities }: RecentActivityPanelProps) {
  const { translate } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
          {translate("recentActivity")}
        </CardTitle>
        <CardDescription>{translate("recentActivityDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <EmptyState
            description="Activity logs will appear as users work through documents."
            icon={History}
            title={translate("noDataYet")}
          />
        ) : (
          <AnimatedList className="space-y-3">
            {recentActivities.map((activityLog) => (
              <AnimatedListItem key={activityLog.id}>
              <div
                className="flex flex-col gap-2 rounded-lg border border-border/80 bg-white/72 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{activityLog.action}</Badge>
                    {activityLog.targetType ? (
                      <span className="text-xs text-muted-foreground">
                        {activityLog.targetType}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-foreground">
                    {activityLog.userName ?? activityLog.userEmail ?? "System"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {activityLog.targetId ?? "No target"}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">
                  {formatDateTime(activityLog.createdAt)}
                </p>
              </div>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </CardContent>
    </Card>
  );
}
