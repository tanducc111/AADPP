import { apiClient } from "@/lib/apiClient";
import { mapActivityLog } from "@/services/dashboardService";
import type {
  ActivityLogListApiResponse,
  ActivityLogListResponse,
  AdminActivityLogQuery,
} from "@/types/dashboard";

export async function getAdminActivityLogs(
  adminActivityLogQuery: AdminActivityLogQuery,
): Promise<ActivityLogListResponse> {
  const activityLogResponse = await apiClient.get<ActivityLogListApiResponse>(
    "/admin/activity-logs",
    {
      params: {
        search: adminActivityLogQuery.search || undefined,
        action: adminActivityLogQuery.action || undefined,
        user_id: adminActivityLogQuery.userId || undefined,
        from_date: adminActivityLogQuery.fromDate || undefined,
        to_date: adminActivityLogQuery.toDate || undefined,
        page: adminActivityLogQuery.page,
        page_size: adminActivityLogQuery.pageSize,
        sort_by: adminActivityLogQuery.sortBy,
        sort_order: adminActivityLogQuery.sortOrder,
      },
    },
  );

  return {
    records: activityLogResponse.data.records.map(mapActivityLog),
    total: activityLogResponse.data.total,
    page: activityLogResponse.data.page,
    pageSize: activityLogResponse.data.page_size,
    totalPages: activityLogResponse.data.total_pages,
  };
}
