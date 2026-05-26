import type { UserRole } from "@/types/auth";

export type AdminUserApiResponse = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  google_id: string | null;
  role: UserRole;
  is_active: boolean;
  is_locked: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  uploaded_document_count: number;
  client_company_count: number;
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  googleId: string | null;
  role: UserRole;
  isActive: boolean;
  isLocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedDocumentCount: number;
  clientCompanyCount: number;
};

export type AdminUserListApiResponse = {
  records: AdminUserApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type AdminUserListResponse = {
  records: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminUserListQuery = {
  search?: string;
  role?: UserRole;
  isLocked?: boolean;
  page: number;
  pageSize: number;
  sortBy: "email" | "full_name" | "role" | "last_login_at" | "created_at";
  sortOrder: "asc" | "desc";
};
