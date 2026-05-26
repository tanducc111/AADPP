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
import type { DashboardSummary } from "@/types/dashboard";
import { formatNumber, formatPercentage } from "@/utils/formatNumber";

type DashboardSummaryCardsProps = {
  dashboardSummary: DashboardSummary;
};

export function DashboardSummaryCards({ dashboardSummary }: DashboardSummaryCardsProps) {
  const summaryCards = [
    {
      label: "Total Documents",
      value: formatNumber(dashboardSummary.totalDocuments),
      description: `${formatNumber(dashboardSummary.totalOcrResults)} OCR results stored`,
      icon: FileText,
    },
    {
      label: "Pending Review",
      value: formatNumber(dashboardSummary.ocrDoneDocuments),
      description: "OCR done and waiting for review",
      icon: FileCheck2,
    },
    {
      label: "Approved Documents",
      value: formatNumber(dashboardSummary.approvedDocuments),
      description: `${formatNumber(dashboardSummary.reviewedDocuments)} reviewed but not approved`,
      icon: CheckCircle2,
    },
    {
      label: "OCR Success Rate",
      value: formatPercentage(dashboardSummary.ocrSuccessRate),
      description: "Completed OCR outcomes",
      icon: Gauge,
    },
    {
      label: "Failed Documents",
      value: formatNumber(dashboardSummary.failedDocuments),
      description: "Needs retry or manual inspection",
      icon: TriangleAlert,
    },
    {
      label: "Active Client Companies",
      value: formatNumber(dashboardSummary.activeClientCompanies),
      description: `${formatNumber(dashboardSummary.totalClientCompanies)} total visible companies`,
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
