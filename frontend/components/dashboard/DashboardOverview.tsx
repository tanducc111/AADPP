"use client";

import { RefreshCcw, ShieldCheck } from "lucide-react";

import { DashboardAnalyticsCharts } from "@/components/dashboard/DashboardAnalyticsCharts";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { RecentActivityPanel } from "@/components/dashboard/RecentActivityPanel";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { useLanguage } from "@/hooks/useLanguage";

export function DashboardOverview() {
  const { currentUser } = useAuth();
  const { translate } = useLanguage();
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
      <div className="flex flex-col gap-7">
        <SectionHeader
          actions={
            <>
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              {currentUser?.role ?? translate("authenticated")}
            </div>
            <Button onClick={handleRefreshDashboard} type="button" variant="outline">
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              {translate("refresh")}
            </Button>
            </>
          }
          badge={translate("analytics")}
          description={translate("dashboardDescription")}
          title={translate("dashboardTitle")}
        />

        {summaryErrorMessage || analyticsErrorMessage ? (
          <Card className="border-destructive/30 bg-red-50/80 p-4 shadow-none">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-destructive">
                {summaryErrorMessage ?? analyticsErrorMessage}
              </p>
              <Button onClick={handleRefreshDashboard} type="button" variant="outline">
                {translate("retry")}
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
                className="shimmer-surface h-80 rounded-lg border border-border"
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

        {!isLoadingAnalytics ? (
          <AnimatedContainer delay={0.08}>
            <RecentActivityPanel recentActivities={recentActivities} />
          </AnimatedContainer>
        ) : null}
      </div>
    </DashboardShell>
  );
}
