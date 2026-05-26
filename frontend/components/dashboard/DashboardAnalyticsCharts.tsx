"use client";

import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";
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

import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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

const CHART_COLORS = ["#0052ff", "#10b981", "#f59e0b", "#ef4444", "#64748b", "#06b6d4"];
const tooltipStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.12)",
};

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
    <AnimatedList className="grid gap-4 xl:grid-cols-2">
      <AnimatedListItem>
      <Card>
        <CardHeader>
          <CardTitle>{translate("documentsByType")}</CardTitle>
          <CardDescription>{translate("documentsByTypeDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartFrame isEmpty={documentTypeData.every((chartPoint) => chartPoint.count === 0)}>
            <ResponsiveContainer height={260} width="100%">
              <BarChart data={documentTypeData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis axisLine={false} dataKey="label" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0, 82, 255, 0.06)" }} />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </CardContent>
      </Card>
      </AnimatedListItem>

      <AnimatedListItem>
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
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </CardContent>
      </Card>
      </AnimatedListItem>

      <AnimatedListItem>
      <Card>
        <CardHeader>
          <CardTitle>{translate("uploadsOverTime")}</CardTitle>
          <CardDescription>{translate("uploadsOverTimeDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartFrame isEmpty={uploadTrendData.length === 0}>
            <ResponsiveContainer height={260} width="100%">
              <LineChart data={uploadTrendData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis axisLine={false} dataKey="label" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  dataKey="count"
                  dot={{ fill: "#ffffff", r: 4, stroke: CHART_COLORS[0], strokeWidth: 2 }}
                  stroke={CHART_COLORS[0]}
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </CardContent>
      </Card>
      </AnimatedListItem>

      <AnimatedListItem>
      <Card>
        <CardHeader>
          <CardTitle>{translate("topClientCompanies")}</CardTitle>
          <CardDescription>{translate("topClientCompaniesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {topClientCompanies.length === 0 ? (
            <EmptyChartState />
          ) : (
            <div className="table-surface overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50/90 font-mono text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client Company</th>
                    <th className="px-4 py-3 text-right font-medium">Documents</th>
                    <th className="px-4 py-3 text-right font-medium">Approved</th>
                    <th className="px-4 py-3 text-right font-medium">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {topClientCompanies.map((clientCompany) => (
                    <tr
                      className="border-t border-border/80 transition-colors hover:bg-blue-50/40"
                      key={clientCompany.clientCompanyId}
                    >
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
      </AnimatedListItem>
    </AnimatedList>
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
    <div className="flex h-[260px] items-center justify-center">
      <EmptyState
        description={translate("noDataYetDescription")}
        icon={BarChart3}
        title={translate("noDataYet")}
      />
    </div>
  );
}
