"use client";

import {
  Building2,
  CheckCircle2,
  FileCheck2,
  FileText,
  Gauge,
  TriangleAlert,
} from "lucide-react";

import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-container";
import { MetricCard } from "@/components/ui/metric-card";
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
      accentClassName: "bg-blue-50 text-primary",
    },
    {
      label: translate("pendingReview"),
      value: formatNumber(dashboardSummary.ocrDoneDocuments),
      description: translate("pendingReviewDescription"),
      icon: FileCheck2,
      accentClassName: "bg-amber-50 text-amber-600 ring-amber-100",
    },
    {
      label: translate("approvedDocuments"),
      value: formatNumber(dashboardSummary.approvedDocuments),
      description: `${formatNumber(dashboardSummary.reviewedDocuments)} ${translate("approvedDocumentsDescription")}`,
      icon: CheckCircle2,
      accentClassName: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
    {
      label: translate("ocrSuccessRate"),
      value: formatPercentage(dashboardSummary.ocrSuccessRate),
      description: translate("ocrSuccessRateDescription"),
      icon: Gauge,
      accentClassName: "bg-cyan-50 text-cyan-600 ring-cyan-100",
    },
    {
      label: translate("failedDocuments"),
      value: formatNumber(dashboardSummary.failedDocuments),
      description: translate("failedDocumentsDescription"),
      icon: TriangleAlert,
      accentClassName: "bg-red-50 text-red-600 ring-red-100",
    },
    {
      label: translate("activeClientCompanies"),
      value: formatNumber(dashboardSummary.activeClientCompanies),
      description: `${formatNumber(dashboardSummary.totalClientCompanies)} ${translate("activeClientCompaniesDescription")}`,
      icon: Building2,
      accentClassName: "bg-slate-100 text-slate-700 ring-slate-200",
    },
  ];

  return (
    <AnimatedList className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {summaryCards.map((summaryCard) => (
        <AnimatedListItem key={summaryCard.label}>
          <MetricCard
            accentClassName={summaryCard.accentClassName}
            description={summaryCard.description}
            icon={summaryCard.icon}
            label={summaryCard.label}
            value={summaryCard.value}
          />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}
