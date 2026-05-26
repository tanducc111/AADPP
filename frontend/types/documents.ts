import type { AuthenticatedUserApiResponse, UserRole } from "@/types/auth";

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

export type DocumentClientCompanySummary = {
  id: string;
  companyName: string;
  taxCode: string | null;
  isActive: boolean;
};

export type DocumentUploaderSummary = {
  id: string;
  email: string;
  fullName: string;
};

export type DocumentClientCompanySummaryApiResponse = {
  id: string;
  company_name: string;
  tax_code: string | null;
  is_active: boolean;
};

export type DocumentUploaderSummaryApiResponse = Pick<
  AuthenticatedUserApiResponse,
  "id" | "email" | "full_name"
>;

export type DocumentApiResponse = {
  id: string;
  client_company_id: string;
  uploaded_by_user_id: string;
  original_file_name: string;
  stored_file_name: string;
  file_size: number;
  mime_type: string;
  document_type: DocumentType;
  document_category: string | null;
  status: DocumentStatus;
  note: string | null;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
};

export type DocumentListItemApiResponse = DocumentApiResponse & {
  client_company: DocumentClientCompanySummaryApiResponse;
  uploaded_by: DocumentUploaderSummaryApiResponse;
};

export type DocumentDetailApiResponse = DocumentListItemApiResponse;

export type UploadedDocument = {
  id: string;
  clientCompanyId: string;
  uploadedByUserId: string;
  originalFileName: string;
  storedFileName: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  documentCategory: string | null;
  status: DocumentStatus;
  note: string | null;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentListItem = UploadedDocument & {
  clientCompany: DocumentClientCompanySummary;
  uploadedBy: DocumentUploaderSummary;
};

export type DocumentDetail = DocumentListItem;

export type DocumentListApiResponse = {
  records: DocumentListItemApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type DocumentListResponse = {
  records: DocumentListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DocumentListQuery = {
  search?: string;
  clientCompanyId?: string;
  documentType?: DocumentType;
  status?: DocumentStatus;
  uploadedFrom?: string;
  uploadedTo?: string;
  page: number;
  pageSize: number;
  sortBy: "original_file_name" | "document_type" | "status" | "uploaded_at" | "file_size";
  sortOrder: "asc" | "desc";
};

export type DocumentUploadPayload = {
  file: File;
  clientCompanyId: string;
  documentType: DocumentType;
  documentCategory: string;
  note: string;
};

export type DocumentDownload = {
  blob: Blob;
  fileName: string;
  mimeType: string;
};

export type DocumentActionContext = {
  currentUserId: string;
  currentUserRole: UserRole;
};
