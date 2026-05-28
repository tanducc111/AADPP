"use client";

import { ClipboardCheck, Download, FileText, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/clients/ConfirmDialog";
import { DocumentBreadcrumbs } from "@/components/documents/DocumentBreadcrumbs";
import { DocumentFilePreview } from "@/components/documents/DocumentFilePreview";
import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { DocumentTypeBadge } from "@/components/documents/DocumentTypeBadge";
import { OcrRegionController } from "@/components/documents/OcrRegionController";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteDocument,
  downloadDocument,
  getDocument,
  triggerBrowserDownload,
} from "@/services/documentService";
import type { DocumentDetail } from "@/types/documents";
import { formatDateTime } from "@/utils/formatDate";
import { formatFileSize } from "@/utils/formatFileSize";
import { getErrorMessage } from "@/utils/getErrorMessage";

type DocumentDetailPageContentProps = {
  documentId: string;
};

export function DocumentDetailPageContent({ documentId }: DocumentDetailPageContentProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [previewElement, setPreviewElement] = useState<HTMLElement | null>(null);
  const canDeleteDocument =
    Boolean(documentDetail && currentUser?.role === "ADMIN") ||
    Boolean(
      documentDetail &&
        currentUser &&
        documentDetail.uploadedByUserId === currentUser.id &&
        (documentDetail.status === "UPLOADED" || documentDetail.status === "FAILED"),
    );
  const canUseDocumentWorkflow =
    Boolean(documentDetail && currentUser?.role === "ADMIN") ||
    Boolean(documentDetail && currentUser && documentDetail.uploadedByUserId === currentUser.id);
  const canRunOcr =
    canUseDocumentWorkflow &&
    Boolean(documentDetail && (documentDetail.status === "UPLOADED" || documentDetail.status === "FAILED"));
  const canRunRegionOcr =
    canUseDocumentWorkflow &&
    Boolean(documentDetail && isRegionOcrPreviewSupported(documentDetail.mimeType));
  const canViewOcrResult =
    canUseDocumentWorkflow &&
    Boolean(
      documentDetail &&
        (documentDetail.status === "OCR_DONE" ||
          documentDetail.status === "REVIEWED" ||
          documentDetail.status === "APPROVED"),
    );

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadDocumentDetail() {
      setIsLoadingDocument(true);

      try {
        const selectedDocument = await getDocument(documentId);

        if (shouldUpdateState) {
          setDocumentDetail(selectedDocument);
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load document."));
      } finally {
        if (shouldUpdateState) {
          setIsLoadingDocument(false);
        }
      }
    }

    void loadDocumentDetail();

    return () => {
      shouldUpdateState = false;
    };
  }, [documentId]);

  async function handleDownloadDocument() {
    if (!documentDetail) {
      return;
    }

    setIsProcessingAction(true);

    try {
      const documentDownload = await downloadDocument(documentDetail.id);
      triggerBrowserDownload(documentDownload);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to download document."));
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleDeleteDocument() {
    if (!documentDetail) {
      return;
    }

    setIsProcessingAction(true);

    try {
      await deleteDocument(documentDetail.id);
      toast.success("Document deleted.");
      router.push(ROUTES.documents);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete document."));
    } finally {
      setIsProcessingAction(false);
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <DocumentBreadcrumbs
          breadcrumbs={[
            { label: "Documents", href: ROUTES.documents },
            { label: documentDetail?.originalFileName ?? "Document details" },
          ]}
        />

        {isLoadingDocument ? (
          <div className="space-y-4">
            <LoadingSkeleton className="h-10 max-w-xl" />
            <LoadingSkeleton className="h-72 rounded-lg" />
          </div>
        ) : documentDetail ? (
          <>
            <SectionHeader
              actions={
                <div className="flex flex-wrap gap-2">
                  {canRunOcr ? (
                    <Button asChild disabled={isProcessingAction} type="button">
                      <Link href={`${ROUTES.documents}/${documentDetail.id}/ocr`}>
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Run OCR
                      </Link>
                    </Button>
                  ) : null}
                  {documentDetail && canRunRegionOcr ? (
                    <OcrRegionController documentId={documentDetail.id} previewElement={previewElement} />
                  ) : null}
                  {canViewOcrResult ? (
                    <Button asChild type="button" variant="outline">
                      <Link href={`${ROUTES.documents}/${documentDetail.id}/review`}>
                        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                        View OCR Result
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    disabled={isProcessingAction}
                    onClick={handleDownloadDocument}
                    type="button"
                    variant="outline"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download
                  </Button>
                  {canDeleteDocument ? (
                    <Button
                      disabled={isProcessingAction}
                      onClick={() => setIsDeleteDialogOpen(true)}
                      type="button"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
                  ) : null}
                </div>
              }
              badge="Document"
              description={formatFileSize(documentDetail.fileSize)}
              title={documentDetail.originalFileName}
            />
            <div className="-mt-4 flex flex-wrap items-center gap-2 px-1">
                  <DocumentTypeBadge documentType={documentDetail.documentType} />
                  <DocumentStatusBadge status={documentDetail.status} />
                </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                    File preview
                  </CardTitle>
                  <CardDescription>Original uploaded source file.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentFilePreview
                    documentDetail={documentDetail}
                    onPreviewElementChange={setPreviewElement}
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                    <CardDescription>Upload and classification details.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-4 text-sm">
                      <DetailField label="Client Company" value={documentDetail.clientCompany.companyName} />
                      <DetailField label="Tax Code" value={documentDetail.clientCompany.taxCode} />
                      <DetailField label="Uploaded By" value={documentDetail.uploadedBy.fullName} />
                      <DetailField label="Uploader Email" value={documentDetail.uploadedBy.email} />
                      <DetailField label="Document Category" value={documentDetail.documentCategory} />
                      <DetailField label="MIME Type" value={documentDetail.mimeType} />
                      <DetailField label="Uploaded At" value={formatDateTime(documentDetail.uploadedAt)} />
                      <DetailField label="Updated At" value={formatDateTime(documentDetail.updatedAt)} />
                    </dl>
                  </CardContent>
                </Card>

                {documentDetail.status === "FAILED" ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    OCR failed or the document is marked as failed. You can run OCR again when ready.
                  </div>
                ) : null}

                <Card>
                  <CardHeader>
                    <CardTitle>Note</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {documentDetail.note ?? "No note provided."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Document not found</CardTitle>
              <CardDescription>The selected document is unavailable.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <ConfirmDialog
        confirmLabel="Delete"
        description={`Delete ${documentDetail?.originalFileName ?? "this document"}? This action cannot be undone.`}
        isOpen={isDeleteDialogOpen}
        isProcessing={isProcessingAction}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteDocument}
        title="Delete document"
      />
    </DashboardShell>
  );
}

function isRegionOcrPreviewSupported(mimeType: string) {
  return mimeType === "application/pdf" || mimeType === "image/jpeg" || mimeType === "image/png";
}

type DetailFieldProps = {
  label: string;
  value: string | null;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-medium text-foreground">{value ?? "-"}</dd>
    </div>
  );
}
