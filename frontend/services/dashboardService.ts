import { apiClient } from "@/lib/apiClient";
import type {
  ActivityLog,
  ActivityLogApiResponse,
  DashboardSummary,
  DashboardSummaryApiResponse,
  DocumentStatusAnalytics,
  DocumentStatusAnalyticsApiResponse,
  DocumentTypeAnalytics,
  DocumentTypeAnalyticsApiResponse,
  TopClientCompany,
  TopClientCompanyApiResponse,
  UploadsOverTime,
  UploadsOverTimeApiResponse,
  UploadsOverTimeQuery,
} from "@/types/dashboard";

function mapDashboardSummary(summary: DashboardSummaryApiResponse): DashboardSummary {
  return {
    totalClientCompanies: summary.total_client_companies,
    activeClientCompanies: summary.active_client_companies,
    totalDocuments: summary.total_documents,
    uploadedDocuments: summary.uploaded_documents,
    processingDocuments: summary.processing_documents,
    ocrDoneDocuments: summary.ocr_done_documents,
    reviewedDocuments: summary.reviewed_documents,
    approvedDocuments: summary.approved_documents,
    failedDocuments: summary.failed_documents,
    totalOcrResults: summary.total_ocr_results,
    ocrSuccessRate: summary.ocr_success_rate,
    totalUsers: summary.total_users,
    activeUsers: summary.active_users,
  };
}

function mapDocumentTypeAnalytics(
  documentTypeAnalytics: DocumentTypeAnalyticsApiResponse,
): DocumentTypeAnalytics {
  return {
    documentType: documentTypeAnalytics.document_type,
    count: documentTypeAnalytics.count,
  };
}

function mapDocumentStatusAnalytics(
  documentStatusAnalytics: DocumentStatusAnalyticsApiResponse,
): DocumentStatusAnalytics {
  return {
    status: documentStatusAnalytics.status,
    count: documentStatusAnalytics.count,
  };
}

function mapUploadsOverTime(uploadsOverTime: UploadsOverTimeApiResponse): UploadsOverTime {
  return {
    date: uploadsOverTime.date,
    count: uploadsOverTime.count,
  };
}

function mapTopClientCompany(topClientCompany: TopClientCompanyApiResponse): TopClientCompany {
  return {
    clientCompanyId: topClientCompany.client_company_id,
    companyName: topClientCompany.company_name,
    documentCount: topClientCompany.document_count,
    approvedCount: topClientCompany.approved_count,
    failedCount: topClientCompany.failed_count,
  };
}

export function mapActivityLog(activityLog: ActivityLogApiResponse): ActivityLog {
  return {
    id: activityLog.id,
    action: activityLog.action,
    userName: activityLog.user_name,
    userEmail: activityLog.user_email,
    targetType: activityLog.target_type,
    targetId: activityLog.target_id,
    createdAt: activityLog.created_at,
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const summaryResponse = await apiClient.get<DashboardSummaryApiResponse>("/dashboard/summary");

  return mapDashboardSummary(summaryResponse.data);
}

export async function getDocumentsByType(): Promise<DocumentTypeAnalytics[]> {
  const analyticsResponse = await apiClient.get<DocumentTypeAnalyticsApiResponse[]>(
    "/dashboard/documents-by-type",
  );

  return analyticsResponse.data.map(mapDocumentTypeAnalytics);
}

export async function getDocumentsByStatus(): Promise<DocumentStatusAnalytics[]> {
  const analyticsResponse = await apiClient.get<DocumentStatusAnalyticsApiResponse[]>(
    "/dashboard/documents-by-status",
  );

  return analyticsResponse.data.map(mapDocumentStatusAnalytics);
}

export async function getUploadsOverTime(
  uploadsOverTimeQuery: UploadsOverTimeQuery,
): Promise<UploadsOverTime[]> {
  const uploadsResponse = await apiClient.get<UploadsOverTimeApiResponse[]>(
    "/dashboard/uploads-over-time",
    {
      params: {
        from_date: uploadsOverTimeQuery.fromDate || undefined,
        to_date: uploadsOverTimeQuery.toDate || undefined,
        group_by: uploadsOverTimeQuery.groupBy,
      },
    },
  );

  return uploadsResponse.data.map(mapUploadsOverTime);
}

export async function getTopClientCompanies(): Promise<TopClientCompany[]> {
  const topClientCompanyResponse = await apiClient.get<TopClientCompanyApiResponse[]>(
    "/dashboard/top-client-companies",
  );

  return topClientCompanyResponse.data.map(mapTopClientCompany);
}

export async function getRecentActivities(limit = 10): Promise<ActivityLog[]> {
  const activityResponse = await apiClient.get<ActivityLogApiResponse[]>(
    "/dashboard/recent-activities",
    {
      params: { limit },
    },
  );

  return activityResponse.data.map(mapActivityLog);
}
