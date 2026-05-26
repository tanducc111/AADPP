"use client";

import {
  Building2,
  CheckCircle2,
  FileCheck2,
  FileText,
  Gauge,
  TriangleAlert,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import type { DashboardSummary } from "@/types/dashboard";
import { formatNumber, formatPercentage } from "@/utils/formatNumber";

type DashboardSummaryCardsProps = {
  dashboardSummary: DashboardSummary;
};

export function DashboardSummaryCards({ dashboardSummary }: DashboardSummaryCardsProps) {
  const { translate } = useLanguage();
  const summaryCards = [
    {
      label: translate("totalDocuments"),
      value: formatNumber(dashboardSummary.totalDocuments),
      description: `${formatNumber(dashboardSummary.totalOcrResults)} ${translate("totalDocumentsDescription")}`,
      icon: FileText,
    },
    {
      label: translate("pendingReview"),
      value: formatNumber(dashboardSummary.ocrDoneDocuments),
      description: translate("pendingReviewDescription"),
      icon: FileCheck2,
    },
    {
      label: translate("approvedDocuments"),
      value: formatNumber(dashboardSummary.approvedDocuments),
      description: `${formatNumber(dashboardSummary.reviewedDocuments)} ${translate("approvedDocumentsDescription")}`,
      icon: CheckCircle2,
    },
    {
      label: translate("ocrSuccessRate"),
      value: formatPercentage(dashboardSummary.ocrSuccessRate),
      description: translate("ocrSuccessRateDescription"),
      icon: Gauge,
    },
    {
      label: translate("failedDocuments"),
      value: formatNumber(dashboardSummary.failedDocuments),
      description: translate("failedDocumentsDescription"),
      icon: TriangleAlert,
    },
    {
      label: translate("activeClientCompanies"),
      value: formatNumber(dashboardSummary.activeClientCompanies),
      description: `${formatNumber(dashboardSummary.totalClientCompanies)} ${translate("activeClientCompaniesDescription")}`,
      icon: Building2,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {summaryCards.map((summaryCard) => {
        const SummaryIcon = summaryCard.icon;

        return (
          <Card key={summaryCard.label}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <div>
                <p className="text-sm text-muted-foreground">{summaryCard.label}</p>
                <CardTitle className="mt-2 text-2xl">{summaryCard.value}</CardTitle>
              </div>
              <span className="rounded-md bg-accent p-2 text-accent-foreground">
                <SummaryIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{summaryCard.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
