"use client";

import { ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/clients/ConfirmDialog";
import { DocumentBreadcrumbs } from "@/components/documents/DocumentBreadcrumbs";
import { DocumentFilePreview } from "@/components/documents/DocumentFilePreview";
import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { OcrRegionController } from "@/components/documents/OcrRegionController";
import { OcrReviewForm } from "@/components/documents/OcrReviewForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useOcrResult } from "@/hooks/useOcrResult";
import { getDocument } from "@/services/documentService";
import { approveDocumentOcrResult, updateDocumentOcrResult } from "@/services/ocrService";
import type { DocumentDetail } from "@/types/documents";
import type { OcrReviewFormValues } from "@/types/ocr";
import { formatDateTime } from "@/utils/formatDate";
import { getErrorMessage } from "@/utils/getErrorMessage";

type DocumentReviewPageContentProps = {
  documentId: string;
};

export function DocumentReviewPageContent({ documentId }: DocumentReviewPageContentProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { isLoadingOcrResult, ocrErrorMessage, ocrResult, setOcrResult } = useOcrResult(documentId);
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [previewElement, setPreviewElement] = useState<HTMLElement | null>(null);
  const isApproved = documentDetail?.status === "APPROVED";
  const canRunRegionOcr =
    Boolean(
      documentDetail &&
        currentUser &&
        isRegionOcrPreviewSupported(documentDetail.mimeType) &&
        (currentUser.role === "ADMIN" || documentDetail.uploadedByUserId === currentUser.id),
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

  async function handleSaveReview(ocrReviewFormValues: OcrReviewFormValues) {
    setIsSaving(true);

    try {
      const updatedOcrResult = await updateDocumentOcrResult(documentId, ocrReviewFormValues);
      setOcrResult(updatedOcrResult);
      setDocumentDetail((currentDocumentDetail) =>
        currentDocumentDetail ? { ...currentDocumentDetail, status: "REVIEWED" } : currentDocumentDetail,
      );
      toast.success("OCR result reviewed.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save OCR result."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApproveDocument() {
    setIsApproving(true);

    try {
      const approvedOcrResult = await approveDocumentOcrResult(documentId);
      setOcrResult(approvedOcrResult);
      setDocumentDetail((currentDocumentDetail) =>
        currentDocumentDetail ? { ...currentDocumentDetail, status: "APPROVED" } : currentDocumentDetail,
      );
      setIsApproveDialogOpen(false);
      toast.success("Document approved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to approve document."));
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <DocumentBreadcrumbs
          breadcrumbs={[
            { label: "Documents", href: ROUTES.documents },
            { label: documentDetail?.originalFileName ?? "OCR review" },
          ]}
        />

        <SectionHeader
          actions={
            <div className="flex flex-wrap gap-2">
              {documentDetail && canRunRegionOcr ? (
                <OcrRegionController documentId={documentDetail.id} previewElement={previewElement} />
              ) : null}
              <Button
                onClick={() => router.push(`${ROUTES.documents}/${documentId}`)}
                type="button"
                variant="outline"
              >
                Back to Document
              </Button>
            </div>
          }
          badge="OCR Review"
          description={
            ocrResult?.processedAt ? `Processed ${formatDateTime(ocrResult.processedAt)}` : undefined
          }
          title={documentDetail?.originalFileName ?? "Review OCR result"}
        />
        <div className="-mt-4 flex flex-wrap items-center gap-2 px-1">
          {documentDetail ? <DocumentStatusBadge status={documentDetail.status} /> : null}
        </div>

        {isLoadingDocument || isLoadingOcrResult ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <LoadingSkeleton className="h-[520px] rounded-lg" />
            <LoadingSkeleton className="h-[520px] rounded-lg" />
          </div>
        ) : documentDetail && ocrResult ? (
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="xl:sticky xl:top-24 xl:self-start">
              <CardHeader>
                <CardTitle>Document preview</CardTitle>
                <CardDescription>Compare the source file with the extracted accounting data.</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentFilePreview
                  documentDetail={documentDetail}
                  onPreviewElementChange={setPreviewElement}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                  Extracted accounting data
                </CardTitle>
                <CardDescription>
                  {isApproved
                    ? "This document is approved and cannot be edited."
                    : "Review, correct, and approve the structured OCR result."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OcrReviewForm
                  isApproved={Boolean(isApproved)}
                  isApproving={isApproving}
                  isSaving={isSaving}
                  ocrResult={ocrResult}
                  onApprove={() => setIsApproveDialogOpen(true)}
                  onCancel={() => router.push(`${ROUTES.documents}/${documentId}`)}
                  onSubmit={handleSaveReview}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>OCR result</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                action={
                  <Button
                    onClick={() => router.push(`${ROUTES.documents}/${documentId}/ocr`)}
                    type="button"
                  >
                    Run OCR
                  </Button>
                }
                description={ocrErrorMessage ?? "Run OCR before reviewing extracted accounting data."}
                icon={ClipboardCheck}
                title="OCR result not found"
              />
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        confirmLabel="Approve"
        description="Approve this OCR result and lock further edits for the current workflow?"
        isOpen={isApproveDialogOpen}
        isProcessing={isApproving}
        onCancel={() => setIsApproveDialogOpen(false)}
        onConfirm={handleApproveDocument}
        title="Approve document"
      />
    </DashboardShell>
  );
}

function isRegionOcrPreviewSupported(mimeType: string) {
  return mimeType === "application/pdf" || mimeType === "image/jpeg" || mimeType === "image/png";
}
