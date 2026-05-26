import type { LucideIcon } from "lucide-react";

import type { DocumentStatus, DocumentType } from "@/types/documents";

export type DashboardMetric = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export type DashboardSummaryApiResponse = {
  total_client_companies: number;
  active_client_companies: number;
  total_documents: number;
  uploaded_documents: number;
  processing_documents: number;
  ocr_done_documents: number;
  reviewed_documents: number;
  approved_documents: number;
  failed_documents: number;
  total_ocr_results: number;
  ocr_success_rate: number;
  total_users: number;
  active_users: number;
};

export type DashboardSummary = {
  totalClientCompanies: number;
  activeClientCompanies: number;
  totalDocuments: number;
  uploadedDocuments: number;
  processingDocuments: number;
  ocrDoneDocuments: number;
  reviewedDocuments: number;
  approvedDocuments: number;
  failedDocuments: number;
  totalOcrResults: number;
  ocrSuccessRate: number;
  totalUsers: number;
  activeUsers: number;
};

export type DocumentTypeAnalyticsApiResponse = {
  document_type: DocumentType;
  count: number;
};

export type DocumentTypeAnalytics = {
  documentType: DocumentType;
  count: number;
};

export type DocumentStatusAnalyticsApiResponse = {
  status: DocumentStatus;
  count: number;
};

export type DocumentStatusAnalytics = {
  status: DocumentStatus;
  count: number;
};

export type UploadsGroupBy = "day" | "week" | "month";

export type UploadsOverTimeQuery = {
  fromDate?: string;
  toDate?: string;
  groupBy: UploadsGroupBy;
};

export type UploadsOverTimeApiResponse = {
  date: string;
  count: number;
};

export type UploadsOverTime = {
  date: string;
  count: number;
};

export type TopClientCompanyApiResponse = {
  client_company_id: string;
  company_name: string;
  document_count: number;
  approved_count: number;
  failed_count: number;
};

export type TopClientCompany = {
  clientCompanyId: string;
  companyName: string;
  documentCount: number;
  approvedCount: number;
  failedCount: number;
};

export type ActivityLogApiResponse = {
  id: string;
  action: string;
  user_name: string | null;
  user_email: string | null;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  userName: string | null;
  userEmail: string | null;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
};

export type AdminActivityLogQuery = {
  search?: string;
  action?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
  sortBy: "created_at" | "action" | "user_email";
  sortOrder: "asc" | "desc";
};

export type ActivityLogListApiResponse = {
  records: ActivityLogApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type ActivityLogListResponse = {
  records: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
