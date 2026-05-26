"use client";

import { Building2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ClientCompanyBreadcrumbs } from "@/components/clients/ClientCompanyBreadcrumbs";
import { ClientCompanyTable } from "@/components/clients/ClientCompanyTable";
import { ClientCompanyTableSkeleton } from "@/components/clients/ClientCompanyTableSkeleton";
import { ConfirmDialog } from "@/components/clients/ConfirmDialog";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useClientCompanies } from "@/hooks/useClientCompanies";
import {
  deleteClientCompany,
  updateClientCompanyStatus,
} from "@/services/clientCompanyService";
import type { ClientCompany } from "@/types/clientCompanies";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function ClientCompaniesPageContent() {
  const { currentUser } = useAuth();
  const {
    clientCompanies,
    clientCompanyErrorMessage,
    clientCompanyQuery,
    isLoadingClientCompanies,
    refreshClientCompanies,
    totalPages,
    totalRecords,
    updateClientCompanyQuery,
  } = useClientCompanies();
  const [companySearchQuery, setCompanySearchQuery] = useState(clientCompanyQuery.search ?? "");
  const [selectedClientCompany, setSelectedClientCompany] = useState<ClientCompany | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const canManageClientCompanies = currentUser?.role === "ADMIN";

  async function handleDeleteClientCompany() {
    if (!selectedClientCompany) {
      return;
    }

    setIsProcessingAction(true);

    try {
      await deleteClientCompany(selectedClientCompany.id);
      toast.success("Client company deleted.");
      setIsDeleteDialogOpen(false);
      setSelectedClientCompany(null);
      refreshClientCompanies();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete client company."));
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleStatusChange(clientCompany: ClientCompany) {
    setIsProcessingAction(true);

    try {
      await updateClientCompanyStatus(clientCompany.id, !clientCompany.isActive);
      toast.success(clientCompany.isActive ? "Client company deactivated." : "Client company activated.");
      refreshClientCompanies();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update client company status."));
    } finally {
      setIsProcessingAction(false);
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <ClientCompanyBreadcrumbs breadcrumbs={[{ label: "Clients" }]} />

        <SectionHeader
          actions={canManageClientCompanies ? (
            <Button asChild>
              <Link href={`${ROUTES.clientCompanies}/new`}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Client
              </Link>
            </Button>
          ) : null}
          badge="Client Companies"
          description="Manage the accounting clients that documents will be attached to in later phases."
          title="Client company management"
        />

        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Companies
                </CardTitle>
                <CardDescription>{totalRecords} records found</CardDescription>
              </div>
              <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_160px_160px_130px]">
                <div className="input-surface flex items-center gap-2 rounded-md px-3">
                  <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
                    onChange={(event) => setCompanySearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        updateClientCompanyQuery({ search: companySearchQuery, page: 1 });
                      }
                    }}
                    value={companySearchQuery}
                  />
                </div>
                <select
                  className={selectClassName}
                  onChange={(event) =>
                    updateClientCompanyQuery({
                      isActive:
                        event.target.value === "all"
                          ? undefined
                          : event.target.value === "active",
                      page: 1,
                    })
                  }
                  value={
                    clientCompanyQuery.isActive === undefined
                      ? "all"
                      : clientCompanyQuery.isActive
                        ? "active"
                        : "inactive"
                  }
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  className={selectClassName}
                  onChange={(event) =>
                    updateClientCompanyQuery({
                      sortBy: event.target.value as typeof clientCompanyQuery.sortBy,
                      page: 1,
                    })
                  }
                  value={clientCompanyQuery.sortBy}
                >
                  <option value="company_name">Company Name</option>
                  <option value="tax_code">Tax Code</option>
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Updated Date</option>
                  <option value="is_active">Status</option>
                </select>
                <Button
                  onClick={() => updateClientCompanyQuery({ search: companySearchQuery, page: 1 })}
                  type="button"
                  variant="outline"
                >
                  Search
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {clientCompanyErrorMessage ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {clientCompanyErrorMessage}
              </div>
            ) : null}

            {isLoadingClientCompanies ? (
              <ClientCompanyTableSkeleton />
            ) : clientCompanies.length === 0 ? (
              <EmptyState
                action={
                  canManageClientCompanies ? (
                    <Button asChild variant="outline">
                      <Link href={`${ROUTES.clientCompanies}/new`}>Create Client</Link>
                    </Button>
                  ) : null
                }
                description="Adjust the search or create the first client."
                icon={Building2}
                title="No client companies found"
              />
            ) : currentUser ? (
              <ClientCompanyTable
                clientCompanies={clientCompanies}
                currentUserRole={currentUser.role}
                isProcessingAction={isProcessingAction}
                onDelete={(clientCompany) => {
                  setSelectedClientCompany(clientCompany);
                  setIsDeleteDialogOpen(true);
                }}
                onStatusChange={handleStatusChange}
              />
            ) : null}

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {clientCompanyQuery.page} of {Math.max(totalPages, 1)}
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={clientCompanyQuery.page <= 1 || isLoadingClientCompanies}
                  onClick={() => updateClientCompanyQuery({ page: clientCompanyQuery.page - 1 })}
                  type="button"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={clientCompanyQuery.page >= totalPages || isLoadingClientCompanies}
                  onClick={() => updateClientCompanyQuery({ page: clientCompanyQuery.page + 1 })}
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
        confirmLabel="Delete"
        description={`Delete ${selectedClientCompany?.companyName ?? "this client company"}? This action cannot be undone.`}
        isOpen={isDeleteDialogOpen}
        isProcessing={isProcessingAction}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedClientCompany(null);
        }}
        onConfirm={handleDeleteClientCompany}
        title="Delete client company"
      />
    </DashboardShell>
  );
}

const selectClassName =
  "input-surface h-10 rounded-md px-3 text-sm text-foreground outline-none";
