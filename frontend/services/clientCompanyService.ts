import { apiClient } from "@/lib/apiClient";
import type {
  ClientCompany,
  ClientCompanyApiResponse,
  ClientCompanyFormValues,
  ClientCompanyListApiResponse,
  ClientCompanyListQuery,
  ClientCompanyListResponse,
} from "@/types/clientCompanies";

function mapClientCompany(clientCompany: ClientCompanyApiResponse): ClientCompany {
  return {
    id: clientCompany.id,
    companyName: clientCompany.company_name,
    taxCode: clientCompany.tax_code,
    address: clientCompany.address,
    contactPerson: clientCompany.contact_person,
    phoneNumber: clientCompany.phone_number,
    email: clientCompany.email,
    description: clientCompany.description,
    isActive: clientCompany.is_active,
    createdByUserId: clientCompany.created_by_user_id,
    createdAt: clientCompany.created_at,
    updatedAt: clientCompany.updated_at,
  };
}

function mapClientCompanyList(
  clientCompanyList: ClientCompanyListApiResponse,
): ClientCompanyListResponse {
  return {
    records: clientCompanyList.records.map(mapClientCompany),
    total: clientCompanyList.total,
    page: clientCompanyList.page,
    pageSize: clientCompanyList.page_size,
    totalPages: clientCompanyList.total_pages,
  };
}

function mapFormValuesToPayload(clientCompanyFormValues: ClientCompanyFormValues) {
  return {
    company_name: clientCompanyFormValues.companyName,
    tax_code: clientCompanyFormValues.taxCode || null,
    address: clientCompanyFormValues.address || null,
    contact_person: clientCompanyFormValues.contactPerson || null,
    phone_number: clientCompanyFormValues.phoneNumber || null,
    email: clientCompanyFormValues.email || null,
    description: clientCompanyFormValues.description || null,
  };
}

export async function getClientCompanies(
  clientCompanyListQuery: ClientCompanyListQuery,
): Promise<ClientCompanyListResponse> {
  const clientCompanyResponse = await apiClient.get<ClientCompanyListApiResponse>(
    "/client-companies",
    {
      params: {
        search: clientCompanyListQuery.search || undefined,
        is_active: clientCompanyListQuery.isActive,
        page: clientCompanyListQuery.page,
        page_size: clientCompanyListQuery.pageSize,
        sort_by: clientCompanyListQuery.sortBy,
        sort_order: clientCompanyListQuery.sortOrder,
      },
    },
  );

  return mapClientCompanyList(clientCompanyResponse.data);
}

export async function getClientCompany(clientCompanyId: string): Promise<ClientCompany> {
  const clientCompanyResponse = await apiClient.get<ClientCompanyApiResponse>(
    `/client-companies/${clientCompanyId}`,
  );

  return mapClientCompany(clientCompanyResponse.data);
}

export async function createClientCompany(
  clientCompanyFormValues: ClientCompanyFormValues,
): Promise<ClientCompany> {
  const clientCompanyResponse = await apiClient.post<ClientCompanyApiResponse>(
    "/client-companies",
    mapFormValuesToPayload(clientCompanyFormValues),
  );

  return mapClientCompany(clientCompanyResponse.data);
}

export async function updateClientCompany(
  clientCompanyId: string,
  clientCompanyFormValues: ClientCompanyFormValues,
): Promise<ClientCompany> {
  const clientCompanyResponse = await apiClient.put<ClientCompanyApiResponse>(
    `/client-companies/${clientCompanyId}`,
    mapFormValuesToPayload(clientCompanyFormValues),
  );

  return mapClientCompany(clientCompanyResponse.data);
}

export async function deleteClientCompany(clientCompanyId: string): Promise<void> {
  await apiClient.delete(`/client-companies/${clientCompanyId}`);
}

export async function updateClientCompanyStatus(
  clientCompanyId: string,
  isActive: boolean,
): Promise<ClientCompany> {
  const clientCompanyResponse = await apiClient.patch<ClientCompanyApiResponse>(
    `/client-companies/${clientCompanyId}/status`,
    { is_active: isActive },
  );

  return mapClientCompany(clientCompanyResponse.data);
}
