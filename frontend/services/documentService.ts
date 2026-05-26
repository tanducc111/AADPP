import { apiClient } from "@/lib/apiClient";
import type {
  DocumentApiResponse,
  DocumentDetail,
  DocumentDetailApiResponse,
  DocumentDownload,
  DocumentListApiResponse,
  DocumentListItem,
  DocumentListItemApiResponse,
  DocumentListQuery,
  DocumentListResponse,
  DocumentUploadPayload,
  UploadedDocument,
} from "@/types/documents";

function mapBaseDocument(uploadedDocument: DocumentApiResponse): UploadedDocument {
  return {
    id: uploadedDocument.id,
    clientCompanyId: uploadedDocument.client_company_id,
    uploadedByUserId: uploadedDocument.uploaded_by_user_id,
    originalFileName: uploadedDocument.original_file_name,
    storedFileName: uploadedDocument.stored_file_name,
    fileSize: uploadedDocument.file_size,
    mimeType: uploadedDocument.mime_type,
    documentType: uploadedDocument.document_type,
    documentCategory: uploadedDocument.document_category,
    status: uploadedDocument.status,
    note: uploadedDocument.note,
    uploadedAt: uploadedDocument.uploaded_at,
    createdAt: uploadedDocument.created_at,
    updatedAt: uploadedDocument.updated_at,
  };
}

function mapDocumentListItem(uploadedDocument: DocumentListItemApiResponse): DocumentListItem {
  return {
    ...mapBaseDocument(uploadedDocument),
    clientCompany: {
      id: uploadedDocument.client_company.id,
      companyName: uploadedDocument.client_company.company_name,
      taxCode: uploadedDocument.client_company.tax_code,
      isActive: uploadedDocument.client_company.is_active,
    },
    uploadedBy: {
      id: uploadedDocument.uploaded_by.id,
      email: uploadedDocument.uploaded_by.email,
      fullName: uploadedDocument.uploaded_by.full_name,
    },
  };
}

function mapDocumentList(documentList: DocumentListApiResponse): DocumentListResponse {
  return {
    records: documentList.records.map(mapDocumentListItem),
    total: documentList.total,
    page: documentList.page,
    pageSize: documentList.page_size,
    totalPages: documentList.total_pages,
  };
}

function mapDocumentDetail(documentDetail: DocumentDetailApiResponse): DocumentDetail {
  return mapDocumentListItem(documentDetail);
}

function buildDocumentUploadFormData(documentUploadPayload: DocumentUploadPayload): FormData {
  const documentFormData = new FormData();
  documentFormData.append("file", documentUploadPayload.file);
  documentFormData.append("client_company_id", documentUploadPayload.clientCompanyId);
  documentFormData.append("document_type", documentUploadPayload.documentType);

  if (documentUploadPayload.documentCategory) {
    documentFormData.append("document_category", documentUploadPayload.documentCategory);
  }

  if (documentUploadPayload.note) {
    documentFormData.append("note", documentUploadPayload.note);
  }

  return documentFormData;
}

export async function getDocuments(
  documentListQuery: DocumentListQuery,
): Promise<DocumentListResponse> {
  const documentResponse = await apiClient.get<DocumentListApiResponse>("/documents", {
    params: {
      search: documentListQuery.search || undefined,
      client_company_id: documentListQuery.clientCompanyId || undefined,
      document_type: documentListQuery.documentType || undefined,
      status: documentListQuery.status || undefined,
      uploaded_from: documentListQuery.uploadedFrom
        ? `${documentListQuery.uploadedFrom}T00:00:00Z`
        : undefined,
      uploaded_to: documentListQuery.uploadedTo
        ? `${documentListQuery.uploadedTo}T23:59:59Z`
        : undefined,
      page: documentListQuery.page,
      page_size: documentListQuery.pageSize,
      sort_by: documentListQuery.sortBy,
      sort_order: documentListQuery.sortOrder,
    },
  });

  return mapDocumentList(documentResponse.data);
}

export async function getDocument(documentId: string): Promise<DocumentDetail> {
  const documentResponse = await apiClient.get<DocumentDetailApiResponse>(`/documents/${documentId}`);

  return mapDocumentDetail(documentResponse.data);
}

export async function uploadDocument(
  documentUploadPayload: DocumentUploadPayload,
): Promise<UploadedDocument> {
  const documentResponse = await apiClient.post<DocumentApiResponse>(
    "/documents/upload",
    buildDocumentUploadFormData(documentUploadPayload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return mapBaseDocument(documentResponse.data);
}

export async function downloadDocument(documentId: string): Promise<DocumentDownload> {
  const documentResponse = await apiClient.get<Blob>(`/documents/${documentId}/download`, {
    responseType: "blob",
  });
  const contentDispositionHeader = documentResponse.headers["content-disposition"];
  const contentDisposition =
    typeof contentDispositionHeader === "string" ? contentDispositionHeader : undefined;
  const fileName = parseContentDispositionFileName(contentDisposition) ?? "document";
  const contentTypeHeader = documentResponse.headers["content-type"];
  const mimeType =
    typeof contentTypeHeader === "string" ? contentTypeHeader : "application/octet-stream";

  return {
    blob: documentResponse.data,
    fileName,
    mimeType,
  };
}

export async function deleteDocument(documentId: string): Promise<void> {
  await apiClient.delete(`/documents/${documentId}`);
}

export function triggerBrowserDownload(documentDownload: DocumentDownload) {
  const downloadUrl = window.URL.createObjectURL(documentDownload.blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = documentDownload.fileName;
  downloadLink.click();
  window.URL.revokeObjectURL(downloadUrl);
}

function parseContentDispositionFileName(contentDisposition: string | undefined): string | null {
  if (!contentDisposition) {
    return null;
  }

  const utfFileNameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);

  if (utfFileNameMatch?.[1]) {
    return decodeURIComponent(utfFileNameMatch[1]);
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

  return fileNameMatch?.[1] ?? null;
}
