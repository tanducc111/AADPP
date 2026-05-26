import type { DocumentStatus, DocumentType } from "@/types/documents";

export const DOCUMENT_TYPE_OPTIONS: Array<{ label: string; value: DocumentType }> = [
  { label: "VAT Invoice", value: "VAT_INVOICE" },
  { label: "Receipt", value: "RECEIPT" },
  { label: "Payment Voucher", value: "PAYMENT_VOUCHER" },
  { label: "Import Warehouse", value: "IMPORT_WAREHOUSE" },
  { label: "Export Warehouse", value: "EXPORT_WAREHOUSE" },
  { label: "Other", value: "OTHER" },
];

export const DOCUMENT_STATUS_OPTIONS: Array<{ label: string; value: DocumentStatus }> = [
  { label: "Uploaded", value: "UPLOADED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "OCR Done", value: "OCR_DONE" },
  { label: "Reviewed", value: "REVIEWED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Failed", value: "FAILED" },
];

export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;
export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const MAX_DOCUMENT_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export function getDocumentTypeLabel(documentType: DocumentType) {
  return DOCUMENT_TYPE_OPTIONS.find((option) => option.value === documentType)?.label ?? documentType;
}

export function getDocumentStatusLabel(documentStatus: DocumentStatus) {
  return DOCUMENT_STATUS_OPTIONS.find((option) => option.value === documentStatus)?.label ?? documentStatus;
}
