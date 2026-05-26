"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DocumentBreadcrumbs } from "@/components/documents/DocumentBreadcrumbs";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SectionHeader } from "@/components/ui/section-header";
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
        <SectionHeader
          badge="Documents"
          description="Attach a source accounting document to an active client company."
          title="Upload document"
        />

        <Card>
          <CardHeader>
            <CardTitle>Document metadata</CardTitle>
            <CardDescription>File validation runs in the browser and again on the backend.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingClientCompanies ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="space-y-4">
                  <LoadingSkeleton className="h-10" />
                  <LoadingSkeleton className="h-10" />
                  <LoadingSkeleton className="h-28" />
                </div>
                <LoadingSkeleton className="h-64 rounded-lg" />
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
