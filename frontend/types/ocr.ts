import type { DocumentType } from "@/types/documents";

export type OcrLineItem = {
  id: string;
  ocrResultId: string;
  itemName: string | null;
  quantity: number | null;
  unitPrice: number | null;
  amount: number | null;
  vatRate: number | null;
  createdAt: string;
  updatedAt: string;
};

export type OcrLineItemApiResponse = {
  id: string;
  ocr_result_id: string;
  item_name: string | null;
  quantity: string | number | null;
  unit_price: string | number | null;
  amount: string | number | null;
  vat_rate: string | number | null;
  created_at: string;
  updated_at: string;
};

export type OcrResult = {
  id: string;
  documentId: string;
  documentType: DocumentType | null;
  companyName: string | null;
  taxCode: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  subtotal: number | null;
  vatAmount: number | null;
  totalAmount: number | null;
  currency: string | null;
  confidenceScore: number | null;
  rawText: string | null;
  rawJson: Record<string, unknown> | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  approvedByUserId: string | null;
  approvedAt: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lineItems: OcrLineItem[];
};

export type OcrResultApiResponse = {
  id: string;
  document_id: string;
  document_type: DocumentType | null;
  company_name: string | null;
  tax_code: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  subtotal: string | number | null;
  vat_amount: string | number | null;
  total_amount: string | number | null;
  currency: string | null;
  confidence_score: string | number | null;
  raw_text: string | null;
  raw_json: Record<string, unknown> | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  approved_by_user_id: string | null;
  approved_at: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  line_items: OcrLineItemApiResponse[];
};

export type OcrLineItemFormValues = {
  itemName: string;
  quantity: number | null;
  unitPrice: number | null;
  amount: number | null;
  vatRate: number | null;
};

export type OcrReviewFormValues = {
  documentType: DocumentType;
  companyName: string;
  taxCode: string;
  invoiceNumber: string;
  invoiceDate: string;
  subtotal: number | null;
  vatAmount: number | null;
  totalAmount: number | null;
  currency: string;
  confidenceScore: number | null;
  rawText: string;
  rawJson: Record<string, unknown> | null;
  lineItems: OcrLineItemFormValues[];
};
