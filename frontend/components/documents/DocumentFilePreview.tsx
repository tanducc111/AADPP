"use client";

import { useEffect, useState } from "react";

import { downloadDocument } from "@/services/documentService";
import type { DocumentDetail } from "@/types/documents";

type DocumentFilePreviewProps = {
  documentDetail: DocumentDetail;
};

export function DocumentFilePreview({ documentDetail }: DocumentFilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let shouldUpdateState = true;

    async function loadPreview() {
      await Promise.resolve();

      if (!isPreviewSupported(documentDetail.mimeType)) {
        if (shouldUpdateState) {
          setPreviewUrl(null);
        }
        return;
      }

      try {
        const documentDownload = await downloadDocument(documentDetail.id);
        objectUrl = window.URL.createObjectURL(documentDownload.blob);

        if (shouldUpdateState) {
          setPreviewUrl(objectUrl);
        }
      } catch {
        if (shouldUpdateState) {
          setPreviewUrl(null);
        }
      }
    }

    void loadPreview();

    return () => {
      shouldUpdateState = false;

      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [documentDetail]);

  if (!isPreviewSupported(documentDetail.mimeType)) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
        Preview is not available for this file type.
      </div>
    );
  }

  if (!previewUrl) {
    return <div className="min-h-72 rounded-lg bg-muted" />;
  }

  if (documentDetail.mimeType === "application/pdf") {
    return (
      <iframe
        className="h-[520px] w-full rounded-lg border border-border bg-background"
        src={previewUrl}
        title={documentDetail.originalFileName}
      />
    );
  }

  return (
    <div className="flex min-h-72 items-center justify-center rounded-lg border border-border bg-background p-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- Blob previews cannot use the Next image optimizer. */}
      <img
        alt={documentDetail.originalFileName}
        className="max-h-[520px] max-w-full rounded-md object-contain"
        src={previewUrl}
      />
    </div>
  );
}

function isPreviewSupported(mimeType: string) {
  return mimeType === "application/pdf" || mimeType === "image/jpeg" || mimeType === "image/png";
}
