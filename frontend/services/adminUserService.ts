import { apiClient } from "@/lib/apiClient";
import type {
  AdminUser,
  AdminUserApiResponse,
  AdminUserListApiResponse,
  AdminUserListQuery,
  AdminUserListResponse,
} from "@/types/adminUsers";

function mapAdminUser(adminUser: AdminUserApiResponse): AdminUser {
  return {
    id: adminUser.id,
    email: adminUser.email,
    fullName: adminUser.full_name,
    avatarUrl: adminUser.avatar_url,
    googleId: adminUser.google_id,
    role: adminUser.role,
    isActive: adminUser.is_active,
    isLocked: adminUser.is_locked,
    lastLoginAt: adminUser.last_login_at,
    createdAt: adminUser.created_at,
    updatedAt: adminUser.updated_at,
    uploadedDocumentCount: adminUser.uploaded_document_count,
    clientCompanyCount: adminUser.client_company_count,
  };
}

function mapAdminUserList(adminUserList: AdminUserListApiResponse): AdminUserListResponse {
  return {
    records: adminUserList.records.map(mapAdminUser),
    total: adminUserList.total,
    page: adminUserList.page,
    pageSize: adminUserList.page_size,
    totalPages: adminUserList.total_pages,
  };
}

export async function getAdminUsers(
  adminUserListQuery: AdminUserListQuery,
): Promise<AdminUserListResponse> {
  const adminUserResponse = await apiClient.get<AdminUserListApiResponse>("/admin/users", {
    params: {
      search: adminUserListQuery.search || undefined,
      role: adminUserListQuery.role || undefined,
      is_locked: adminUserListQuery.isLocked,
      page: adminUserListQuery.page,
      page_size: adminUserListQuery.pageSize,
      sort_by: adminUserListQuery.sortBy,
      sort_order: adminUserListQuery.sortOrder,
    },
  });

  return mapAdminUserList(adminUserResponse.data);
}

export async function updateAdminUserAccess(
  userId: string,
  isLocked: boolean,
): Promise<AdminUser> {
  const adminUserResponse = await apiClient.patch<AdminUserApiResponse>(
    `/admin/users/${userId}/access`,
    { is_locked: isLocked },
  );

  return mapAdminUser(adminUserResponse.data);
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}`);
}
