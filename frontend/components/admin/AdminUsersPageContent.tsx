"use client";

import { Lock, Search, Trash2, Unlock, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/clients/ConfirmDialog";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { deleteAdminUser, updateAdminUserAccess } from "@/services/adminUserService";
import type { AdminUser } from "@/types/adminUsers";
import { formatDateTime } from "@/utils/formatDate";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function AdminUsersPageContent() {
  const { currentUser } = useAuth();
  const {
    adminUserQuery,
    adminUsers,
    isLoadingUsers,
    refreshAdminUsers,
    totalPages,
    totalRecords,
    updateAdminUserQuery,
    userErrorMessage,
  } = useAdminUsers();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [pendingAction, setPendingAction] = useState<"block" | "unblock" | "delete" | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  async function handleConfirmUserAction() {
    if (!selectedUser || !pendingAction) {
      return;
    }

    setIsProcessingAction(true);

    try {
      if (pendingAction === "delete") {
        await deleteAdminUser(selectedUser.id);
        toast.success("User deleted.");
      } else {
        await updateAdminUserAccess(selectedUser.id, pendingAction === "block");
        toast.success(pendingAction === "block" ? "User access blocked." : "User access restored.");
      }

      setSelectedUser(null);
      setPendingAction(null);
      refreshAdminUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update user."));
    } finally {
      setIsProcessingAction(false);
    }
  }

  const dialogContent = getDialogContent(selectedUser, pendingAction);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary">Admin Users</Badge>
            <h1 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
              User management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              View accounts, block or restore access, and remove unused user accounts.
            </p>
          </div>
          <Button onClick={refreshAdminUsers} type="button" variant="outline">
            Refresh
          </Button>
        </section>

        <Card>
          <CardHeader className="gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                Users
              </CardTitle>
              <CardDescription>{totalRecords} accounts found</CardDescription>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.4fr_0.7fr_0.7fr]">
              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">Search</span>
                <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3">
                  <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
                    onChange={(event) =>
                      updateAdminUserQuery({ page: 1, search: event.target.value })
                    }
                    placeholder="Email or name"
                    value={adminUserQuery.search ?? ""}
                  />
                </div>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">Role</span>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
                  onChange={(event) =>
                    updateAdminUserQuery({
                      page: 1,
                      role:
                        event.target.value === "ADMIN" || event.target.value === "ACCOUNTANT"
                          ? event.target.value
                          : undefined,
                    })
                  }
                  value={adminUserQuery.role ?? ""}
                >
                  <option value="">All roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="ACCOUNTANT">ACCOUNTANT</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">Access</span>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none"
                  onChange={(event) =>
                    updateAdminUserQuery({
                      isLocked:
                        event.target.value === ""
                          ? undefined
                          : event.target.value === "locked",
                      page: 1,
                    })
                  }
                  value={
                    adminUserQuery.isLocked === undefined
                      ? ""
                      : adminUserQuery.isLocked
                        ? "locked"
                        : "active"
                  }
                >
                  <option value="">All access</option>
                  <option value="active">Active access</option>
                  <option value="locked">Blocked access</option>
                </select>
              </label>
            </div>
          </CardHeader>

          <CardContent>
            {userErrorMessage ? (
              <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {userErrorMessage}
              </div>
            ) : null}

            {isLoadingUsers ? (
              <AdminUsersSkeleton />
            ) : adminUsers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
                <h2 className="text-base font-semibold text-foreground">No users found</h2>
                <p className="mt-2 text-sm text-muted-foreground">Adjust search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-muted text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Access</th>
                      <th className="px-4 py-3 font-medium">Business Records</th>
                      <th className="px-4 py-3 font-medium">Last Login</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((adminUser) => (
                      <tr className="border-t border-border" key={adminUser.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{adminUser.fullName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{adminUser.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{adminUser.role}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <UserAccessBadge adminUser={adminUser} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {adminUser.uploadedDocumentCount} documents / {adminUser.clientCompanyCount} companies
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {adminUser.lastLoginAt ? formatDateTime(adminUser.lastLoginAt) : "Never"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              aria-label={adminUser.isLocked ? "Unblock user" : "Block user"}
                              disabled={adminUser.id === currentUser?.id || isProcessingAction}
                              onClick={() => {
                                setSelectedUser(adminUser);
                                setPendingAction(adminUser.isLocked ? "unblock" : "block");
                              }}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              {adminUser.isLocked ? (
                                <Unlock className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Lock className="h-4 w-4" aria-hidden="true" />
                              )}
                            </Button>
                            <Button
                              aria-label="Delete user"
                              disabled={adminUser.id === currentUser?.id || isProcessingAction}
                              onClick={() => {
                                setSelectedUser(adminUser);
                                setPendingAction("delete");
                              }}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {adminUserQuery.page} of {Math.max(totalPages, 1)}
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={adminUserQuery.page <= 1 || isLoadingUsers}
                  onClick={() => updateAdminUserQuery({ page: adminUserQuery.page - 1 })}
                  type="button"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={adminUserQuery.page >= totalPages || isLoadingUsers}
                  onClick={() => updateAdminUserQuery({ page: adminUserQuery.page + 1 })}
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

      <ConfirmDialog
        confirmLabel={dialogContent.confirmLabel}
        description={dialogContent.description}
        isOpen={Boolean(selectedUser && pendingAction)}
        isProcessing={isProcessingAction}
        onCancel={() => {
          setSelectedUser(null);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmUserAction}
        title={dialogContent.title}
      />
    </DashboardShell>
  );
}

function UserAccessBadge({ adminUser }: { adminUser: AdminUser }) {
  if (!adminUser.isActive) {
    return <Badge variant="outline">Inactive</Badge>;
  }

  return adminUser.isLocked ? <Badge variant="secondary">Blocked</Badge> : <Badge>Active</Badge>;
}

function AdminUsersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, skeletonIndex) => (
        <div
          className="h-16 animate-pulse rounded-md border border-border bg-muted"
          key={skeletonIndex}
        />
      ))}
    </div>
  );
}

function getDialogContent(
  selectedUser: AdminUser | null,
  pendingAction: "block" | "unblock" | "delete" | null,
) {
  const userName = selectedUser?.email ?? "this user";

  if (pendingAction === "delete") {
    return {
      confirmLabel: "Delete",
      description: `Delete ${userName}? Users with accounting records cannot be deleted and should be blocked instead.`,
      title: "Delete user",
    };
  }

  if (pendingAction === "unblock") {
    return {
      confirmLabel: "Unblock",
      description: `Restore access for ${userName}?`,
      title: "Unblock user",
    };
  }

  return {
    confirmLabel: "Block",
    description: `Block access for ${userName}? The user will no longer be able to access protected APIs.`,
    title: "Block user",
  };
}
