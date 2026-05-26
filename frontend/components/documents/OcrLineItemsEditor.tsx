"use client";

import { Plus, Trash2 } from "lucide-react";
import { type Control, useFieldArray, type UseFormRegister } from "react-hook-form";

import { Button } from "@/components/ui/button";
import type { OcrReviewFormValues } from "@/types/ocr";

type OcrLineItemsEditorProps = {
  control: Control<OcrReviewFormValues>;
  isReadOnly: boolean;
  register: UseFormRegister<OcrReviewFormValues>;
};

export function OcrLineItemsEditor({
  control,
  isReadOnly,
  register,
}: OcrLineItemsEditorProps) {
  const { append, fields, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Line items</h2>
        {!isReadOnly ? (
          <Button
            onClick={() =>
              append({
                itemName: "",
                quantity: null,
                unitPrice: null,
                amount: null,
                vatRate: null,
              })
            }
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Row
          </Button>
        ) : null}
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
          No line items detected.
        </div>
      ) : (
        <div className="table-surface overflow-x-auto">
          <table className="min-w-[820px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50/90 font-mono text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-3 font-medium">Item Name</th>
                <th className="px-3 py-3 font-medium">Quantity</th>
                <th className="px-3 py-3 font-medium">Unit Price</th>
                <th className="px-3 py-3 font-medium">Amount</th>
                <th className="px-3 py-3 font-medium">VAT Rate</th>
                <th className="px-3 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((lineItemField, lineItemIndex) => (
                <tr
                  className="border-t border-border/80 transition-colors hover:bg-blue-50/40"
                  key={lineItemField.id}
                >
                  <td className="px-3 py-2">
                    <input
                      className={inputClassName}
                      disabled={isReadOnly}
                      {...register(`lineItems.${lineItemIndex}.itemName`)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={inputClassName}
                      disabled={isReadOnly}
                      step="0.0001"
                      type="number"
                      {...register(`lineItems.${lineItemIndex}.quantity`, { setValueAs: normalizeNumber })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={inputClassName}
                      disabled={isReadOnly}
                      step="0.01"
                      type="number"
                      {...register(`lineItems.${lineItemIndex}.unitPrice`, { setValueAs: normalizeNumber })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={inputClassName}
                      disabled={isReadOnly}
                      step="0.01"
                      type="number"
                      {...register(`lineItems.${lineItemIndex}.amount`, { setValueAs: normalizeNumber })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={inputClassName}
                      disabled={isReadOnly}
                      step="0.0001"
                      type="number"
                      {...register(`lineItems.${lineItemIndex}.vatRate`, { setValueAs: normalizeNumber })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end">
                      {!isReadOnly ? (
                        <Button
                          aria-label="Delete line item"
                          onClick={() => remove(lineItemIndex)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function normalizeNumber(rawValue: unknown) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return null;
  }

  return Number(rawValue);
}

const inputClassName =
  "input-surface h-10 w-full rounded-md px-3 text-sm text-foreground outline-none disabled:bg-muted disabled:text-muted-foreground";
