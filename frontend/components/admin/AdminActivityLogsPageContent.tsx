"use client";

import { Activity, Search } from "lucide-react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminActivityLogs } from "@/hooks/useAdminActivityLogs";
import { formatDateTime } from "@/utils/formatDate";

const ACTIVITY_ACTION_OPTIONS = [
  "LOGIN",
  "LOGOUT",
  "FAILED_LOGIN",
  "UPLOAD_DOCUMENT",
  "START_OCR",
  "OCR_SUCCESS",
  "OCR_FAILED",
  "UPDATE_OCR_RESULT",
  "APPROVE_DOCUMENT",
  "CREATE_CLIENT_COMPANY",
  "UPDATE_CLIENT_COMPANY",
  "DELETE_CLIENT_COMPANY",
];

export function AdminActivityLogsPageContent() {
  const {
    activityLogErrorMessage,
    activityLogQuery,
    activityLogs,
    isLoadingActivityLogs,
    refreshActivityLogs,
    totalPages,
    totalRecords,
    updateActivityLogQuery,
  } = useAdminActivityLogs();

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary">Admin Audit</Badge>
            <h1 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
              Activity logs
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Search and review authentication, client company, document, OCR, and approval events.
            </p>
          </div>
          <Button onClick={refreshActivityLogs} type="button" variant="outline">
            Refresh
          </Button>
        </section>

        <Card>
          <CardHeader className="gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
                Audit trail
              </CardTitle>
              <CardDescription>{totalRecords} records found</CardDescription>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_1fr_1fr_1fr]">
              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">Search</span>
                <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3">
                  <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
                    onChange={(event) =>
                      updateActivityLogQuery({ page: 1, search: event.target.value })
                    }
                    placeholder="Action, user, target"
                    value={activityLogQuery.search ?? ""}
                  />
                </div>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">Action</span>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
                  onChange={(event) =>
                    updateActivityLogQuery({ action: event.target.value || undefined, page: 1 })
                  }
                  value={activityLogQuery.action ?? ""}
                >
                  <option value="">All actions</option>
                  {ACTIVITY_ACTION_OPTIONS.map((actionOption) => (
                    <option key={actionOption} value={actionOption}>
                      {actionOption}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">User ID</span>
                <input
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
                  onChange={(event) =>
                    updateActivityLogQuery({ page: 1, userId: event.target.value || undefined })
                  }
                  placeholder="Optional UUID"
                  value={activityLogQuery.userId ?? ""}
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">From</span>
                <input
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
                  onChange={(event) =>
                    updateActivityLogQuery({ fromDate: event.target.value || undefined, page: 1 })
                  }
                  type="date"
                  value={activityLogQuery.fromDate ?? ""}
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">To</span>
                <input
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
                  onChange={(event) =>
                    updateActivityLogQuery({ page: 1, toDate: event.target.value || undefined })
                  }
                  type="date"
                  value={activityLogQuery.toDate ?? ""}
                />
              </label>
            </div>
          </CardHeader>

          <CardContent>
            {activityLogErrorMessage ? (
              <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {activityLogErrorMessage}
              </div>
            ) : null}

            {isLoadingActivityLogs ? (
              <AdminActivityLogSkeleton />
            ) : activityLogs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
                <h2 className="text-base font-semibold text-foreground">No activity logs found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Adjust filters or wait for users to perform auditable actions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-muted text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Target Type</th>
                      <th className="px-4 py-3 font-medium">Target ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((activityLog) => (
                      <tr className="border-t border-border" key={activityLog.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {formatDateTime(activityLog.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {activityLog.userName ?? "System"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {activityLog.userEmail ?? "No email"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{activityLog.action}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {activityLog.targetType ?? "-"}
                        </td>
                        <td className="max-w-[260px] truncate px-4 py-3 text-muted-foreground">
                          {activityLog.targetId ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {activityLogQuery.page} of {Math.max(totalPages, 1)}
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={activityLogQuery.page <= 1 || isLoadingActivityLogs}
                  onClick={() => updateActivityLogQuery({ page: activityLogQuery.page - 1 })}
                  type="button"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={activityLogQuery.page >= totalPages || isLoadingActivityLogs}
                  onClick={() => updateActivityLogQuery({ page: activityLogQuery.page + 1 })}
                  type="button"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function AdminActivityLogSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, skeletonIndex) => (
        <div
          className="h-14 animate-pulse rounded-md border border-border bg-muted"
          key={skeletonIndex}
        />
      ))}
    </div>
  );
}
