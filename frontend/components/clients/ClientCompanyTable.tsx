"use client";

import { Eye, Pencil, Power, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ClientCompanyStatusBadge } from "@/components/clients/ClientCompanyStatusBadge";
import { ROUTES } from "@/constants/routes";
import { formatDateTime } from "@/utils/formatDate";
import type { ClientCompany } from "@/types/clientCompanies";
import type { UserRole } from "@/types/auth";

type ClientCompanyTableProps = {
  clientCompanies: ClientCompany[];
  currentUserRole: UserRole;
  isProcessingAction: boolean;
  onDelete: (clientCompany: ClientCompany) => void;
  onStatusChange: (clientCompany: ClientCompany) => void;
};

export function ClientCompanyTable({
  clientCompanies,
  currentUserRole,
  isProcessingAction,
  onDelete,
  onStatusChange,
}: ClientCompanyTableProps) {
  const canManageClientCompanies = currentUserRole === "ADMIN";

  return (
    <>
      <div className="table-surface hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50/90 font-mono text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Company Name</th>
              <th className="px-4 py-3 font-medium">Tax Code</th>
              <th className="px-4 py-3 font-medium">Contact Person</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clientCompanies.map((clientCompany) => (
              <tr
                className="border-t border-border/80 transition-colors hover:bg-blue-50/40"
                key={clientCompany.id}
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {clientCompany.companyName}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{clientCompany.taxCode ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {clientCompany.contactPerson ?? "-"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{clientCompany.email ?? "-"}</td>
                <td className="px-4 py-3">
                  <ClientCompanyStatusBadge isActive={clientCompany.isActive} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(clientCompany.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="icon" type="button" variant="ghost">
                      <Link aria-label="View client company" href={`${ROUTES.clientCompanies}/${clientCompany.id}`}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    {canManageClientCompanies ? (
                      <>
                        <Button asChild size="icon" type="button" variant="ghost">
                          <Link
                            aria-label="Edit client company"
                            href={`${ROUTES.clientCompanies}/${clientCompany.id}/edit`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                        <Button
                          aria-label={clientCompany.isActive ? "Deactivate client company" : "Activate client company"}
                          disabled={isProcessingAction}
                          onClick={() => onStatusChange(clientCompany)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Power className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          aria-label="Delete client company"
                          disabled={isProcessingAction}
                          onClick={() => onDelete(clientCompany)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {clientCompanies.map((clientCompany) => (
          <div className="premium-card rounded-lg p-4" key={clientCompany.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-foreground">{clientCompany.companyName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{clientCompany.taxCode ?? "No tax code"}</p>
              </div>
              <ClientCompanyStatusBadge isActive={clientCompany.isActive} />
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="text-right text-foreground">{clientCompany.contactPerson ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="text-right text-foreground">{clientCompany.email ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="text-right text-foreground">{formatDateTime(clientCompany.createdAt)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button asChild size="sm" type="button" variant="outline">
                <Link href={`${ROUTES.clientCompanies}/${clientCompany.id}`}>View</Link>
              </Button>
              {canManageClientCompanies ? (
                <>
                  <Button asChild size="sm" type="button" variant="outline">
                    <Link href={`${ROUTES.clientCompanies}/${clientCompany.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    disabled={isProcessingAction}
                    onClick={() => onStatusChange(clientCompany)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {clientCompany.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    disabled={isProcessingAction}
                    onClick={() => onDelete(clientCompany)}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
