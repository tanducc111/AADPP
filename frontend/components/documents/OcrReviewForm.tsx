"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { OcrLineItemsEditor } from "@/components/documents/OcrLineItemsEditor";
import { Button } from "@/components/ui/button";
import { DOCUMENT_TYPE_OPTIONS } from "@/constants/documents";
import type { OcrResult, OcrReviewFormValues } from "@/types/ocr";

const nullableNumberSchema = z.number().min(0).nullable();

const ocrReviewFormSchema = z.object({
  documentType: z.enum([
    "VAT_INVOICE",
    "RECEIPT",
    "PAYMENT_VOUCHER",
    "IMPORT_WAREHOUSE",
    "EXPORT_WAREHOUSE",
    "OTHER",
  ]),
  companyName: z.string().max(255),
  taxCode: z.string().max(100),
  invoiceNumber: z.string().max(100),
  invoiceDate: z
    .string()
    .refine(
      (invoiceDate) =>
        !invoiceDate ||
        (/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate) && !Number.isNaN(Date.parse(invoiceDate))),
      "Use YYYY-MM-DD.",
    ),
  subtotal: nullableNumberSchema,
  vatAmount: nullableNumberSchema,
  totalAmount: nullableNumberSchema,
  currency: z.string().min(1).max(10),
  confidenceScore: z.number().min(0).max(1).nullable(),
  rawText: z.string(),
  rawJson: z.record(z.string(), z.unknown()).nullable(),
  lineItems: z.array(
    z.object({
      itemName: z.string().max(500),
      quantity: nullableNumberSchema,
      unitPrice: nullableNumberSchema,
      amount: nullableNumberSchema,
      vatRate: nullableNumberSchema,
    }),
  ),
});

type OcrReviewFormProps = {
  isApproved: boolean;
  isApproving: boolean;
  isSaving: boolean;
  ocrResult: OcrResult;
  onApprove: () => void;
  onCancel: () => void;
  onSubmit: (ocrReviewFormValues: OcrReviewFormValues) => Promise<void>;
};

export function OcrReviewForm({
  isApproved,
  isApproving,
  isSaving,
  ocrResult,
  onApprove,
  onCancel,
  onSubmit,
}: OcrReviewFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<OcrReviewFormValues>({
    defaultValues: mapOcrResultToFormValues(ocrResult),
    resolver: zodResolver(ocrReviewFormSchema),
  });

  useEffect(() => {
    reset(mapOcrResultToFormValues(ocrResult));
  }, [ocrResult, reset]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Document Type" errorMessage={errors.documentType?.message}>
          <select
            className={inputClassName}
            disabled={isApproved}
            {...register("documentType")}
          >
            {DOCUMENT_TYPE_OPTIONS.map((documentTypeOption) => (
              <option key={documentTypeOption.value} value={documentTypeOption.value}>
                {documentTypeOption.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Company Name" errorMessage={errors.companyName?.message}>
          <input className={inputClassName} disabled={isApproved} {...register("companyName")} />
        </FormField>

        <FormField label="Tax Code" errorMessage={errors.taxCode?.message}>
          <input className={inputClassName} disabled={isApproved} {...register("taxCode")} />
        </FormField>

        <FormField label="Invoice Number" errorMessage={errors.invoiceNumber?.message}>
          <input className={inputClassName} disabled={isApproved} {...register("invoiceNumber")} />
        </FormField>

        <FormField label="Invoice Date" errorMessage={errors.invoiceDate?.message}>
          <input
            className={inputClassName}
            disabled={isApproved}
            type="date"
            {...register("invoiceDate")}
          />
        </FormField>

        <FormField label="Currency" errorMessage={errors.currency?.message}>
          <input className={inputClassName} disabled={isApproved} {...register("currency")} />
        </FormField>

        <FormField label="Subtotal" errorMessage={errors.subtotal?.message}>
          <input
            className={inputClassName}
            disabled={isApproved}
            min="0"
            step="0.01"
            type="number"
            {...register("subtotal", { setValueAs: normalizeNumber })}
          />
        </FormField>

        <FormField label="VAT Amount" errorMessage={errors.vatAmount?.message}>
          <input
            className={inputClassName}
            disabled={isApproved}
            min="0"
            step="0.01"
            type="number"
            {...register("vatAmount", { setValueAs: normalizeNumber })}
          />
        </FormField>

        <FormField label="Total Amount" errorMessage={errors.totalAmount?.message}>
          <input
            className={inputClassName}
            disabled={isApproved}
            min="0"
            step="0.01"
            type="number"
            {...register("totalAmount", { setValueAs: normalizeNumber })}
          />
        </FormField>

        <FormField label="Confidence Score" errorMessage={errors.confidenceScore?.message}>
          <input
            className={inputClassName}
            disabled={isApproved}
            max="1"
            min="0"
            step="0.01"
            type="number"
            {...register("confidenceScore", { setValueAs: normalizeNumber })}
          />
        </FormField>
      </div>

      <OcrLineItemsEditor control={control} isReadOnly={isApproved} register={register} />

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button disabled={isSaving || isApproving} onClick={onCancel} type="button" variant="outline">
          Back
        </Button>
        {!isApproved ? (
          <>
            <Button disabled={isSaving || isApproving} type="submit" variant="outline">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Save Reviewed Result
            </Button>
            <Button disabled={isSaving || isApproving} onClick={onApprove} type="button">
              {isApproving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Approve Document
            </Button>
          </>
        ) : null}
      </div>
    </form>
  );
}

type FormFieldProps = {
  children: ReactNode;
  errorMessage?: string;
  label: string;
};

function FormField({ children, errorMessage, label }: FormFieldProps) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <div className="mt-2">{children}</div>
      {errorMessage ? <p className="mt-1 text-xs text-destructive">{errorMessage}</p> : null}
    </label>
  );
}

function mapOcrResultToFormValues(ocrResult: OcrResult): OcrReviewFormValues {
  return {
    documentType: ocrResult.documentType ?? "OTHER",
    companyName: ocrResult.companyName ?? "",
    taxCode: ocrResult.taxCode ?? "",
    invoiceNumber: ocrResult.invoiceNumber ?? "",
    invoiceDate: ocrResult.invoiceDate ?? "",
    subtotal: ocrResult.subtotal,
    vatAmount: ocrResult.vatAmount,
    totalAmount: ocrResult.totalAmount,
    currency: ocrResult.currency ?? "VND",
    confidenceScore: ocrResult.confidenceScore,
    rawText: ocrResult.rawText ?? "",
    rawJson: ocrResult.rawJson,
    lineItems: ocrResult.lineItems.map((lineItem) => ({
      itemName: lineItem.itemName ?? "",
      quantity: lineItem.quantity,
      unitPrice: lineItem.unitPrice,
      amount: lineItem.amount,
      vatRate: lineItem.vatRate,
    })),
  };
}

function normalizeNumber(rawValue: unknown) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return null;
  }

  return Number(rawValue);
}

const inputClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:bg-muted disabled:text-muted-foreground";
