"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/clients/ConfirmDialog";
import { DocumentBreadcrumbs } from "@/components/documents/DocumentBreadcrumbs";
import { DocumentFilters } from "@/components/documents/DocumentFilters";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentTableSkeleton } from "@/components/documents/DocumentTableSkeleton";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useDocuments } from "@/hooks/useDocuments";
import { getClientCompanies } from "@/services/clientCompanyService";
import { deleteDocument, downloadDocument, triggerBrowserDownload } from "@/services/documentService";
import type { ClientCompany } from "@/types/clientCompanies";
import type { DocumentListItem } from "@/types/documents";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function DocumentsPageContent() {
  const { currentUser } = useAuth();
  const {
    documentErrorMessage,
    documentQuery,
    documents,
    isLoadingDocuments,
    refreshDocuments,
    totalPages,
    totalRecords,
    updateDocumentQuery,
  } = useDocuments();
  const [activeClientCompanies, setActiveClientCompanies] = useState<ClientCompany[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentListItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadActiveClientCompanies() {
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
        toast.error(getErrorMessage(error, "Unable to load client companies."));
      }
    }

    void loadActiveClientCompanies();

    return () => {
      shouldUpdateState = false;
    };
  }, []);

  async function handleDownloadDocument(documentListItem: DocumentListItem) {
    setIsProcessingAction(true);

    try {
      const documentDownload = await downloadDocument(documentListItem.id);
      triggerBrowserDownload(documentDownload);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to download document."));
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleDeleteDocument() {
    if (!selectedDocument) {
      return;
    }

    setIsProcessingAction(true);

    try {
      await deleteDocument(selectedDocument.id);
      toast.success("Document deleted.");
      setIsDeleteDialogOpen(false);
      setSelectedDocument(null);
      refreshDocuments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete document."));
    } finally {
      setIsProcessingAction(false);
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <DocumentBreadcrumbs breadcrumbs={[{ label: "Documents" }]} />

        <section className="flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary">Documents</Badge>
            <h1 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
              Document management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Upload, organize, download, and manage source accounting documents by client company.
            </p>
          </div>
          <Button asChild>
            <Link href={`${ROUTES.documents}/upload`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Upload
            </Link>
          </Button>
        </section>

        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                  Uploaded documents
                </CardTitle>
                <CardDescription>{totalRecords} records found</CardDescription>
              </div>
            </div>
            <DocumentFilters
              activeClientCompanies={activeClientCompanies}
              documentQuery={documentQuery}
              isLoading={isLoadingDocuments}
              onQueryChange={updateDocumentQuery}
            />
          </CardHeader>
          <CardContent>
            {documentErrorMessage ? (
              <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {documentErrorMessage}
              </div>
            ) : null}

            {isLoadingDocuments ? (
              <DocumentTableSkeleton />
            ) : documents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
                <h2 className="text-base font-semibold text-foreground">No documents found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload a document or adjust the current filters.
                </p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href={`${ROUTES.documents}/upload`}>Upload Document</Link>
                </Button>
              </div>
            ) : currentUser ? (
              <DocumentTable
                currentUserId={currentUser.id}
                currentUserRole={currentUser.role}
                documents={documents}
                isProcessingAction={isProcessingAction}
                onDelete={(documentListItem) => {
                  setSelectedDocument(documentListItem);
                  setIsDeleteDialogOpen(true);
                }}
                onDownload={handleDownloadDocument}
              />
            ) : null}

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {documentQuery.page} of {Math.max(totalPages, 1)}
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={documentQuery.page <= 1 || isLoadingDocuments}
                  onClick={() => updateDocumentQuery({ page: documentQuery.page - 1 })}
                  type="button"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={documentQuery.page >= totalPages || isLoadingDocuments}
                  onClick={() => updateDocumentQuery({ page: documentQuery.page + 1 })}
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
        description={`Delete ${selectedDocument?.originalFileName ?? "this document"}? This action cannot be undone.`}
        isOpen={isDeleteDialogOpen}
        isProcessing={isProcessingAction}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedDocument(null);
        }}
        onConfirm={handleDeleteDocument}
        title="Delete document"
      />
    </DashboardShell>
  );
}
