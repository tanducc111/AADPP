export type ClientCompanyStatus = "active" | "inactive";

export type ClientCompany = {
  id: string;
  companyName: string;
  taxCode: string | null;
  address: string | null;
  contactPerson: string | null;
  phoneNumber: string | null;
  email: string | null;
  description: string | null;
  isActive: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type ClientCompanyApiResponse = {
  id: string;
  company_name: string;
  tax_code: string | null;
  address: string | null;
  contact_person: string | null;
  phone_number: string | null;
  email: string | null;
  description: string | null;
  is_active: boolean;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
};

export type ClientCompanyListApiResponse = {
  records: ClientCompanyApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type ClientCompanyListResponse = {
  records: ClientCompany[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ClientCompanyFormValues = {
  companyName: string;
  taxCode: string;
  address: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  description: string;
};

export type ClientCompanyListQuery = {
  search?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
  sortBy: "company_name" | "tax_code" | "created_at" | "updated_at" | "is_active";
  sortOrder: "asc" | "desc";
};
