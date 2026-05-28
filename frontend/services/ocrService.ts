import { apiClient } from "@/lib/apiClient";
import type {
  OcrLineItem,
  OcrLineItemApiResponse,
  OcrLineItemFormValues,
  OcrResult,
  OcrResultApiResponse,
  OcrReviewFormValues,
} from "@/types/ocr";
import type {
  OcrRegionApiRequest,
  OcrRegionApiResponse,
  OcrRegionRequestPayload,
  OcrRegionResult,
} from "@/types/ocrRegion";

function normalizeNumber(rawValue: string | number | null): number | null {
  if (rawValue === null) {
    return null;
  }

  return Number(rawValue);
}

function mapLineItem(lineItem: OcrLineItemApiResponse): OcrLineItem {
  return {
    id: lineItem.id,
    ocrResultId: lineItem.ocr_result_id,
    itemName: lineItem.item_name,
    quantity: normalizeNumber(lineItem.quantity),
    unitPrice: normalizeNumber(lineItem.unit_price),
    amount: normalizeNumber(lineItem.amount),
    vatRate: normalizeNumber(lineItem.vat_rate),
    createdAt: lineItem.created_at,
    updatedAt: lineItem.updated_at,
  };
}

function mapOcrResult(ocrResult: OcrResultApiResponse): OcrResult {
  return {
    id: ocrResult.id,
    documentId: ocrResult.document_id,
    documentType: ocrResult.document_type,
    companyName: ocrResult.company_name,
    taxCode: ocrResult.tax_code,
    invoiceNumber: ocrResult.invoice_number,
    invoiceDate: ocrResult.invoice_date,
    subtotal: normalizeNumber(ocrResult.subtotal),
    vatAmount: normalizeNumber(ocrResult.vat_amount),
    totalAmount: normalizeNumber(ocrResult.total_amount),
    currency: ocrResult.currency,
    confidenceScore: normalizeNumber(ocrResult.confidence_score),
    rawText: ocrResult.raw_text,
    rawJson: ocrResult.raw_json,
    reviewedByUserId: ocrResult.reviewed_by_user_id,
    reviewedAt: ocrResult.reviewed_at,
    approvedByUserId: ocrResult.approved_by_user_id,
    approvedAt: ocrResult.approved_at,
    processedAt: ocrResult.processed_at,
    createdAt: ocrResult.created_at,
    updatedAt: ocrResult.updated_at,
    lineItems: ocrResult.line_items.map(mapLineItem),
  };
}

function mapLineItemFormValues(lineItem: OcrLineItemFormValues) {
  return {
    item_name: lineItem.itemName || null,
    quantity: lineItem.quantity,
    unit_price: lineItem.unitPrice,
    amount: lineItem.amount,
    vat_rate: lineItem.vatRate,
  };
}

function mapOcrReviewFormValues(ocrReviewFormValues: OcrReviewFormValues) {
  return {
    document_type: ocrReviewFormValues.documentType,
    company_name: ocrReviewFormValues.companyName || null,
    tax_code: ocrReviewFormValues.taxCode || null,
    invoice_number: ocrReviewFormValues.invoiceNumber || null,
    invoice_date: ocrReviewFormValues.invoiceDate || null,
    subtotal: ocrReviewFormValues.subtotal,
    vat_amount: ocrReviewFormValues.vatAmount,
    total_amount: ocrReviewFormValues.totalAmount,
    currency: ocrReviewFormValues.currency || "VND",
    confidence_score: ocrReviewFormValues.confidenceScore,
    raw_text: ocrReviewFormValues.rawText || null,
    raw_json: ocrReviewFormValues.rawJson,
    line_items: ocrReviewFormValues.lineItems.map(mapLineItemFormValues),
  };
}

function mapOcrRegionRequest(regionRequestPayload: OcrRegionRequestPayload): OcrRegionApiRequest {
  return {
    x: regionRequestPayload.x,
    y: regionRequestPayload.y,
    width: regionRequestPayload.width,
    height: regionRequestPayload.height,
    display_width: regionRequestPayload.displayWidth,
    display_height: regionRequestPayload.displayHeight,
    page: regionRequestPayload.page,
  };
}

function mapOcrRegionResult(ocrRegionResponse: OcrRegionApiResponse): OcrRegionResult {
  return {
    success: ocrRegionResponse.success,
    text: ocrRegionResponse.text,
    rawJson: ocrRegionResponse.raw_json,
    confidenceScore:
      ocrRegionResponse.confidence_score === null
        ? null
        : Number(ocrRegionResponse.confidence_score),
  };
}

export async function runDocumentOcr(documentId: string): Promise<OcrResult> {
  const ocrResponse = await apiClient.post<OcrResultApiResponse>(`/documents/${documentId}/ocr`);

  return mapOcrResult(ocrResponse.data);
}

export async function getDocumentOcrResult(documentId: string): Promise<OcrResult> {
  const ocrResponse = await apiClient.get<OcrResultApiResponse>(
    `/documents/${documentId}/ocr-result`,
  );

  return mapOcrResult(ocrResponse.data);
}

export async function updateDocumentOcrResult(
  documentId: string,
  ocrReviewFormValues: OcrReviewFormValues,
): Promise<OcrResult> {
  const ocrResponse = await apiClient.put<OcrResultApiResponse>(
    `/documents/${documentId}/ocr-result`,
    mapOcrReviewFormValues(ocrReviewFormValues),
  );

  return mapOcrResult(ocrResponse.data);
}

export async function approveDocumentOcrResult(documentId: string): Promise<OcrResult> {
  const ocrResponse = await apiClient.post<OcrResultApiResponse>(
    `/documents/${documentId}/approve`,
  );

  return mapOcrResult(ocrResponse.data);
}

export async function runDocumentRegionOcr(
  documentId: string,
  regionRequestPayload: OcrRegionRequestPayload,
): Promise<OcrRegionResult> {
  const ocrResponse = await apiClient.post<OcrRegionApiResponse>(
    `/documents/${documentId}/ocr-region`,
    mapOcrRegionRequest(regionRequestPayload),
    { timeout: 60000 },
  );

  return mapOcrRegionResult(ocrResponse.data);
}
