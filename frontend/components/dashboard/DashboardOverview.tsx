"use client";

import { RefreshCcw, ShieldCheck } from "lucide-react";

import { DashboardAnalyticsCharts } from "@/components/dashboard/DashboardAnalyticsCharts";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { RecentActivityPanel } from "@/components/dashboard/RecentActivityPanel";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";

export function DashboardOverview() {
  const { currentUser } = useAuth();
  const {
    dashboardSummary,
    isLoadingSummary,
    refreshDashboardSummary,
    summaryErrorMessage,
  } = useDashboardSummary();
  const {
    analyticsErrorMessage,
    documentsByStatus,
    documentsByType,
    isLoadingAnalytics,
    recentActivities,
    refreshDashboardAnalytics,
    topClientCompanies,
    uploadsOverTime,
  } = useDashboardAnalytics();

  function handleRefreshDashboard() {
    refreshDashboardSummary();
    refreshDashboardAnalytics();
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Badge variant="secondary">Analytics</Badge>
            <h1 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
              Accounting operations dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Track document intake, Gemini OCR outcomes, review backlog, approvals, client company
              volume, and recent audit activity in one workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              {currentUser?.role ?? "Authenticated"}
            </div>
            <Button onClick={handleRefreshDashboard} type="button" variant="outline">
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </section>

        {summaryErrorMessage || analyticsErrorMessage ? (
          <Card className="border-destructive/40 bg-destructive/10 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-destructive">
                {summaryErrorMessage ?? analyticsErrorMessage}
              </p>
              <Button onClick={handleRefreshDashboard} type="button" variant="outline">
                Retry
              </Button>
            </div>
          </Card>
        ) : null}

        {isLoadingSummary ? (
          <DashboardSkeleton />
        ) : dashboardSummary ? (
          <DashboardSummaryCards dashboardSummary={dashboardSummary} />
        ) : null}

        {isLoadingAnalytics ? (
          <section className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, skeletonIndex) => (
              <div
                className="h-80 animate-pulse rounded-lg border border-border bg-card"
                key={skeletonIndex}
              />
            ))}
          </section>
        ) : (
          <DashboardAnalyticsCharts
            documentsByStatus={documentsByStatus}
            documentsByType={documentsByType}
            topClientCompanies={topClientCompanies}
            uploadsOverTime={uploadsOverTime}
          />
        )}

        {!isLoadingAnalytics ? <RecentActivityPanel recentActivities={recentActivities} /> : null}
      </div>
    </DashboardShell>
  );
}
