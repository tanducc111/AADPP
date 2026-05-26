"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ClientCompanyBreadcrumbs } from "@/components/clients/ClientCompanyBreadcrumbs";
import { ClientCompanyForm } from "@/components/clients/ClientCompanyForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/constants/routes";
import {
  createClientCompany,
  getClientCompany,
  updateClientCompany,
} from "@/services/clientCompanyService";
import type { ClientCompany, ClientCompanyFormValues } from "@/types/clientCompanies";
import { getErrorMessage } from "@/utils/getErrorMessage";

type ClientCompanyFormPageContentProps = {
  clientCompanyId?: string;
  mode: "create" | "edit";
};

export function ClientCompanyFormPageContent({
  clientCompanyId,
  mode,
}: ClientCompanyFormPageContentProps) {
  const router = useRouter();
  const [clientCompany, setClientCompany] = useState<ClientCompany | undefined>();
  const [isLoadingClientCompany, setIsLoadingClientCompany] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageTitle = mode === "create" ? "New client company" : "Edit client company";

  useEffect(() => {
    if (mode !== "edit" || !clientCompanyId) {
      return;
    }

    let shouldUpdateState = true;

    async function loadClientCompany() {
      setIsLoadingClientCompany(true);

      try {
        const selectedClientCompany = await getClientCompany(clientCompanyId as string);

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
  }, [clientCompanyId, mode]);

  async function handleSubmit(clientCompanyFormValues: ClientCompanyFormValues) {
    setIsSubmitting(true);

    try {
      const savedClientCompany =
        mode === "create"
          ? await createClientCompany(clientCompanyFormValues)
          : await updateClientCompany(clientCompanyId as string, clientCompanyFormValues);

      toast.success(mode === "create" ? "Client company created." : "Client company updated.");
      router.push(`${ROUTES.clientCompanies}/${savedClientCompany.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save client company."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <ClientCompanyBreadcrumbs
          breadcrumbs={[
            { label: "Clients", href: ROUTES.clientCompanies },
            { label: pageTitle },
          ]}
        />
        <SectionHeader
          badge="Client Companies"
          description="Create and maintain clean client master data for document workflows."
          title={pageTitle}
        />

        <Card>
          <CardHeader>
            <CardTitle>Company profile</CardTitle>
            <CardDescription>Core company information used across accounting workflows.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingClientCompany ? (
              <div className="space-y-4">
                <LoadingSkeleton className="h-10" />
                <LoadingSkeleton className="h-10" />
                <LoadingSkeleton className="h-28" />
              </div>
            ) : (
              <ClientCompanyForm
                initialClientCompany={clientCompany}
                isSubmitting={isSubmitting}
                onCancel={() => router.push(ROUTES.clientCompanies)}
                onSubmit={handleSubmit}
                submitLabel={mode === "create" ? "Create Client" : "Save Changes"}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
