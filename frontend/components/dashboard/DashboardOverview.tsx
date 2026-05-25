"use client";

import { Activity, Building2, FileCheck2, FileText, ShieldCheck } from "lucide-react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetric } from "@/types/dashboard";

const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Uploaded Documents",
    value: "0",
    description: "Awaiting ingestion pipeline",
    icon: FileText,
  },
  {
    label: "Client Companies",
    value: "0",
    description: "Ready for onboarding",
    icon: Building2,
  },
  {
    label: "Reviewed Documents",
    value: "0",
    description: "Human review queue",
    icon: FileCheck2,
  },
  {
    label: "Audit Events",
    value: "0",
    description: "Activity trail initialized",
    icon: Activity,
  },
];

export function DashboardOverview() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Badge variant="secondary">Authentication enabled</Badge>
            <h1 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
              Accounting document processing workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              AADPP is ready for secure Google SSO, JWT sessions, role-aware navigation,
              and protected API access. Document workflows remain reserved for later phases.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            RBAC active
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map((dashboardMetric) => {
            const MetricIcon = dashboardMetric.icon;

            return (
              <Card key={dashboardMetric.label}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                  <div>
                    <CardDescription>{dashboardMetric.label}</CardDescription>
                    <CardTitle className="mt-2 text-2xl">{dashboardMetric.value}</CardTitle>
                  </div>
                  <span className="rounded-md bg-accent p-2 text-accent-foreground">
                    <MetricIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{dashboardMetric.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Authentication pipeline</CardTitle>
              <CardDescription>Google SSO and JWT session handling are in place.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {["Google SSO", "JWT Session", "RBAC Guard"].map((pipelineStage) => (
                  <div
                    className="rounded-md border border-border bg-background p-4"
                    key={pipelineStage}
                  >
                    <p className="text-sm font-medium text-foreground">{pipelineStage}</p>
                    <p className="mt-2 text-sm leading-5 text-muted-foreground">
                      Foundation ready for focused product workflows.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System readiness</CardTitle>
              <CardDescription>Frontend and API auth contracts are integrated.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Google ID token verification",
                  "Current user endpoint",
                  "Protected route guard",
                  "Global 401 handling",
                ].map((readinessSignal) => (
                  <div className="flex items-center justify-between gap-3" key={readinessSignal}>
                    <span className="text-sm text-foreground">{readinessSignal}</span>
                    <Badge variant="outline">Ready</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}
