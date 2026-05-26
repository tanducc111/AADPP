"use client";

import { Download, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { DocumentTypeBadge } from "@/components/documents/DocumentTypeBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { UserRole } from "@/types/auth";
import type { DocumentListItem } from "@/types/documents";
import { formatDateTime } from "@/utils/formatDate";
import { formatFileSize } from "@/utils/formatFileSize";

type DocumentTableProps = {
  currentUserId: string;
  currentUserRole: UserRole;
  documents: DocumentListItem[];
  isProcessingAction: boolean;
  onDelete: (documentListItem: DocumentListItem) => void;
  onDownload: (documentListItem: DocumentListItem) => void;
};

export function DocumentTable({
  currentUserId,
  currentUserRole,
  documents,
  isProcessingAction,
  onDelete,
  onDownload,
}: DocumentTableProps) {
  return (
    <>
      <div className="table-surface hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50/90 font-mono text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">File Name</th>
              <th className="px-4 py-3 font-medium">Client Company</th>
              <th className="px-4 py-3 font-medium">Document Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Uploaded By</th>
              <th className="px-4 py-3 font-medium">Uploaded Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((uploadedDocument) => (
              <tr
                className="border-t border-border/80 transition-colors hover:bg-blue-50/40"
                key={uploadedDocument.id}
              >
                <td className="px-4 py-3">
                  <div className="max-w-[220px]">
                    <p className="truncate font-medium text-foreground">
                      {uploadedDocument.originalFileName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatFileSize(uploadedDocument.fileSize)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {uploadedDocument.clientCompany.companyName}
                </td>
                <td className="px-4 py-3">
                  <DocumentTypeBadge documentType={uploadedDocument.documentType} />
                </td>
                <td className="px-4 py-3">
                  <DocumentStatusBadge status={uploadedDocument.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {uploadedDocument.uploadedBy.fullName}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(uploadedDocument.uploadedAt)}
                </td>
                <td className="px-4 py-3">
                  <DocumentActions
                    canDeleteDocument={canDeleteDocument(
                      uploadedDocument,
                      currentUserId,
                      currentUserRole,
                    )}
                    documentListItem={uploadedDocument}
                    isProcessingAction={isProcessingAction}
                    onDelete={onDelete}
                    onDownload={onDownload}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {documents.map((uploadedDocument) => (
          <div className="premium-card rounded-lg p-4" key={uploadedDocument.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-medium text-foreground">
                  {uploadedDocument.originalFileName}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {uploadedDocument.clientCompany.companyName}
                </p>
              </div>
              <DocumentStatusBadge status={uploadedDocument.status} />
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Type</dt>
                <dd>
                  <DocumentTypeBadge documentType={uploadedDocument.documentType} />
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Uploaded By</dt>
                <dd className="text-right text-foreground">{uploadedDocument.uploadedBy.fullName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Uploaded</dt>
                <dd className="text-right text-foreground">
                  {formatDateTime(uploadedDocument.uploadedAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Size</dt>
                <dd className="text-right text-foreground">
                  {formatFileSize(uploadedDocument.fileSize)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button asChild size="sm" type="button" variant="outline">
                <Link href={`${ROUTES.documents}/${uploadedDocument.id}`}>View</Link>
              </Button>
              <Button
                disabled={isProcessingAction}
                onClick={() => onDownload(uploadedDocument)}
                size="sm"
                type="button"
                variant="outline"
              >
                Download
              </Button>
              {canDeleteDocument(uploadedDocument, currentUserId, currentUserRole) ? (
                <Button
                  disabled={isProcessingAction}
                  onClick={() => onDelete(uploadedDocument)}
                  size="sm"
                  type="button"
                  variant="destructive"
                >
                  Delete
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

type DocumentActionsProps = {
  canDeleteDocument: boolean;
  documentListItem: DocumentListItem;
  isProcessingAction: boolean;
  onDelete: (documentListItem: DocumentListItem) => void;
  onDownload: (documentListItem: DocumentListItem) => void;
};

function DocumentActions({
  canDeleteDocument,
  documentListItem,
  isProcessingAction,
  onDelete,
  onDownload,
}: DocumentActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button asChild size="icon" type="button" variant="ghost">
        <Link aria-label="View document" href={`${ROUTES.documents}/${documentListItem.id}`}>
          <Eye className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
      <Button
        aria-label="Download document"
        disabled={isProcessingAction}
        onClick={() => onDownload(documentListItem)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
      </Button>
      {canDeleteDocument ? (
        <Button
          aria-label="Delete document"
          disabled={isProcessingAction}
          onClick={() => onDelete(documentListItem)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

function canDeleteDocument(
  uploadedDocument: DocumentListItem,
  currentUserId: string,
  currentUserRole: UserRole,
) {
  if (currentUserRole === "ADMIN") {
    return true;
  }

  return (
    uploadedDocument.uploadedByUserId === currentUserId &&
    (uploadedDocument.status === "UPLOADED" || uploadedDocument.status === "FAILED")
  );
}
