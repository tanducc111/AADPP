"use client";

import { ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export function AdminOverview() {
  const { currentUser } = useAuth();

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary">Admin only</Badge>
            <h1 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
              Administration
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              This protected area verifies that ADMIN-only routes reject non-admin accounts.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            {currentUser?.role}
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              Role gate ready
            </CardTitle>
            <CardDescription>
              User management workflows are intentionally deferred to a later phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Backend RBAC dependencies and frontend route guards are prepared without adding
              client-company, document, or OCR features.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={ROUTES.adminUsers}>Open Users</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={ROUTES.adminActivityLogs}>Open Activity Logs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
