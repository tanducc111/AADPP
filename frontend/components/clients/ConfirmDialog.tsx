"use client";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  confirmLabel: string;
  description: string;
  isOpen: boolean;
  isProcessing?: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  confirmLabel,
  description,
  isOpen,
  isProcessing = false,
  title,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button disabled={isProcessing} onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            disabled={isProcessing}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
