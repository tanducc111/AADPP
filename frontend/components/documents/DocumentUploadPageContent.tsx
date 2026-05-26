"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DocumentBreadcrumbs } from "@/components/documents/DocumentBreadcrumbs";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { getClientCompanies } from "@/services/clientCompanyService";
import { uploadDocument } from "@/services/documentService";
import type { ClientCompany } from "@/types/clientCompanies";
import type { DocumentUploadPayload } from "@/types/documents";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function DocumentUploadPageContent() {
  const router = useRouter();
  const [activeClientCompanies, setActiveClientCompanies] = useState<ClientCompany[]>([]);
  const [isLoadingClientCompanies, setIsLoadingClientCompanies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadActiveClientCompanies() {
      setIsLoadingClientCompanies(true);

      try {
        const clientCompanyList = await getClientCompanies({
          isActive: true,
          page: 1,
          pageSize: 100,
          sortBy: "company_name",
          sortOrder: "asc",
        });

        if (shouldUpdateState) {
          setActiveClientCompanies(clientCompanyList.records);
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load active client companies."));
      } finally {
        if (shouldUpdateState) {
          setIsLoadingClientCompanies(false);
        }
      }
    }

    void loadActiveClientCompanies();

    return () => {
      shouldUpdateState = false;
    };
  }, []);

  async function handleUploadDocument(documentUploadPayload: DocumentUploadPayload) {
    setIsSubmitting(true);

    try {
      const uploadedDocument = await uploadDocument(documentUploadPayload);
      toast.success("Document uploaded.");
      router.push(`${ROUTES.documents}/${uploadedDocument.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to upload document."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <DocumentBreadcrumbs
          breadcrumbs={[
            { label: "Documents", href: ROUTES.documents },
            { label: "Upload" },
          ]}
        />
        <section className="border-b border-border pb-6">
          <Badge variant="secondary">Documents</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
            Upload document
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Attach a source accounting document to an active client company.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Document metadata</CardTitle>
            <CardDescription>File validation runs in the browser and again on the backend.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingClientCompanies ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="h-10 rounded-md bg-muted" />
                  <div className="h-10 rounded-md bg-muted" />
                  <div className="h-28 rounded-md bg-muted" />
                </div>
                <div className="h-64 rounded-lg bg-muted" />
              </div>
            ) : (
              <DocumentUploadForm
                activeClientCompanies={activeClientCompanies}
                isSubmitting={isSubmitting}
                onCancel={() => router.push(ROUTES.documents)}
                onSubmit={handleUploadDocument}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
