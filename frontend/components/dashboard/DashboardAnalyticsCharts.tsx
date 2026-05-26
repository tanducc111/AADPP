"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocumentStatusLabel, getDocumentTypeLabel } from "@/constants/documents";
import { useLanguage } from "@/hooks/useLanguage";
import type {
  DocumentStatusAnalytics,
  DocumentTypeAnalytics,
  TopClientCompany,
  UploadsOverTime,
} from "@/types/dashboard";
import { formatDate } from "@/utils/formatDate";
import { formatNumber } from "@/utils/formatNumber";

const CHART_COLORS = ["#2563eb", "#059669", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"];

type DashboardAnalyticsChartsProps = {
  documentsByStatus: DocumentStatusAnalytics[];
  documentsByType: DocumentTypeAnalytics[];
  topClientCompanies: TopClientCompany[];
  uploadsOverTime: UploadsOverTime[];
};

export function DashboardAnalyticsCharts({
  documentsByStatus,
  documentsByType,
  topClientCompanies,
  uploadsOverTime,
}: DashboardAnalyticsChartsProps) {
  const { translate } = useLanguage();
  const documentTypeData = documentsByType.map((documentTypeCount) => ({
    count: documentTypeCount.count,
    label: getDocumentTypeLabel(documentTypeCount.documentType),
  }));
  const documentStatusData = documentsByStatus
    .filter((documentStatusCount) => documentStatusCount.count > 0)
    .map((documentStatusCount) => ({
      count: documentStatusCount.count,
      label: getDocumentStatusLabel(documentStatusCount.status),
    }));
  const uploadTrendData = uploadsOverTime.map((uploadPoint) => ({
    count: uploadPoint.count,
    label: formatDate(uploadPoint.date),
  }));

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{translate("documentsByType")}</CardTitle>
          <CardDescription>{translate("documentsByTypeDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartFrame isEmpty={documentTypeData.every((chartPoint) => chartPoint.count === 0)}>
            <ResponsiveContainer height={260} width="100%">
              <BarChart data={documentTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{translate("documentsByStatus")}</CardTitle>
          <CardDescription>{translate("documentsByStatusDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartFrame isEmpty={documentStatusData.length === 0}>
            <ResponsiveContainer height={260} width="100%">
              <PieChart>
                <Pie
                  data={documentStatusData}
                  dataKey="count"
                  innerRadius={64}
                  nameKey="label"
                  outerRadius={96}
                  paddingAngle={2}
                >
                  {documentStatusData.map((chartPoint, chartIndex) => (
                    <Cell
                      fill={CHART_COLORS[chartIndex % CHART_COLORS.length]}
                      key={chartPoint.label}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{translate("uploadsOverTime")}</CardTitle>
          <CardDescription>{translate("uploadsOverTimeDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartFrame isEmpty={uploadTrendData.length === 0}>
            <ResponsiveContainer height={260} width="100%">
              <LineChart data={uploadTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} fontSize={11} tickLine={false} />
                <Tooltip />
                <Line
                  dataKey="count"
                  dot={{ r: 3 }}
                  stroke={CHART_COLORS[1]}
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{translate("topClientCompanies")}</CardTitle>
          <CardDescription>{translate("topClientCompaniesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {topClientCompanies.length === 0 ? (
            <EmptyChartState />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client Company</th>
                    <th className="px-4 py-3 text-right font-medium">Documents</th>
                    <th className="px-4 py-3 text-right font-medium">Approved</th>
                    <th className="px-4 py-3 text-right font-medium">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {topClientCompanies.map((clientCompany) => (
                    <tr className="border-t border-border" key={clientCompany.clientCompanyId}>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {clientCompany.companyName}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatNumber(clientCompany.documentCount)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatNumber(clientCompany.approvedCount)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatNumber(clientCompany.failedCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

type ChartFrameProps = {
  children: ReactNode;
  isEmpty: boolean;
};

function ChartFrame({ children, isEmpty }: ChartFrameProps) {
  if (isEmpty) {
    return <EmptyChartState />;
  }

  return <div className="h-[260px] w-full">{children}</div>;
}

function EmptyChartState() {
  const { translate } = useLanguage();

  return (
    <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
      <div>
        <p className="text-sm font-medium text-foreground">{translate("noDataYet")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {translate("noDataYetDescription")}
        </p>
      </div>
    </div>
  );
}
