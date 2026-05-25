"use client";

import { Building2, Mail, Phone, Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ClientCompanyBreadcrumbs } from "@/components/clients/ClientCompanyBreadcrumbs";
import { ClientCompanyStatusBadge } from "@/components/clients/ClientCompanyStatusBadge";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { getClientCompany } from "@/services/clientCompanyService";
import type { ClientCompany } from "@/types/clientCompanies";
import { formatDateTime } from "@/utils/formatDate";
import { getErrorMessage } from "@/utils/getErrorMessage";

type ClientCompanyDetailPageContentProps = {
  clientCompanyId: string;
};

export function ClientCompanyDetailPageContent({
  clientCompanyId,
}: ClientCompanyDetailPageContentProps) {
  const { currentUser } = useAuth();
  const [clientCompany, setClientCompany] = useState<ClientCompany | null>(null);
  const [isLoadingClientCompany, setIsLoadingClientCompany] = useState(true);
  const canManageClientCompanies = currentUser?.role === "ADMIN";

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadClientCompany() {
      setIsLoadingClientCompany(true);

      try {
        const selectedClientCompany = await getClientCompany(clientCompanyId);

        if (shouldUpdateState) {
          setClientCompany(selectedClientCompany);
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load client company."));
      } finally {
        if (shouldUpdateState) {
          setIsLoadingClientCompany(false);
        }
      }
    }

    void loadClientCompany();

    return () => {
      shouldUpdateState = false;
    };
  }, [clientCompanyId]);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <ClientCompanyBreadcrumbs
          breadcrumbs={[
            { label: "Clients", href: ROUTES.clientCompanies },
            { label: clientCompany?.companyName ?? "Client details" },
          ]}
        />

        {isLoadingClientCompany ? (
          <div className="space-y-4">
            <div className="h-10 max-w-xl rounded-md bg-muted" />
            <div className="h-52 rounded-lg bg-muted" />
          </div>
        ) : clientCompany ? (
          <>
            <section className="flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <Badge variant="secondary">Client Company</Badge>
                <h1 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
                  {clientCompany.companyName}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ClientCompanyStatusBadge isActive={clientCompany.isActive} />
                  <span className="text-sm text-muted-foreground">{clientCompany.taxCode ?? "No tax code"}</span>
                </div>
              </div>
              {canManageClientCompanies ? (
                <Button asChild>
                  <Link href={`${ROUTES.clientCompanies}/${clientCompany.id}/edit`}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Link>
                </Button>
              ) : null}
            </section>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    Company information
                  </CardTitle>
                  <CardDescription>Primary profile data for this accounting client.</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-4 text-sm md:grid-cols-2">
                    <DetailField label="Address" value={clientCompany.address} />
                    <DetailField label="Contact Person" value={clientCompany.contactPerson} />
                    <DetailField label="Phone Number" value={clientCompany.phoneNumber} />
                    <DetailField label="Email" value={clientCompany.email} />
                    <DetailField label="Created" value={formatDateTime(clientCompany.createdAt)} />
                    <DetailField label="Updated" value={formatDateTime(clientCompany.updatedAt)} />
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                  <CardDescription>Communication details for accounting coordination.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                    <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="text-sm text-foreground">{clientCompany.email ?? "No email"}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                    <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="text-sm text-foreground">{clientCompany.phoneNumber ?? "No phone number"}</span>
                  </div>
                  {clientCompany.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">{clientCompany.description}</p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Client company not found</CardTitle>
              <CardDescription>The selected client company is unavailable.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

type DetailFieldProps = {
  label: string;
  value: string | null;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium text-foreground">{value ?? "-"}</dd>
    </div>
  );
}
