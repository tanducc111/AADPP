export type DocumentType =
  | "VAT_INVOICE"
  | "RECEIPT"
  | "PAYMENT_VOUCHER"
  | "IMPORT_WAREHOUSE"
  | "EXPORT_WAREHOUSE"
  | "OTHER";

export type DocumentStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "OCR_DONE"
  | "REVIEWED"
  | "APPROVED"
  | "FAILED";

export type UploadedDocument = {
  id: string;
  clientCompanyName: string;
  originalFileName: string;
  documentType: DocumentType;
  documentStatus: DocumentStatus;
  uploadedAt: string;
};
