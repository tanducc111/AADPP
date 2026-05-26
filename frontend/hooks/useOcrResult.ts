"use client";

import { useEffect, useState } from "react";

import { getDocumentOcrResult } from "@/services/ocrService";
import type { OcrResult } from "@/types/ocr";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useOcrResult(documentId: string) {
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrErrorMessage, setOcrErrorMessage] = useState<string | null>(null);
  const [isLoadingOcrResult, setIsLoadingOcrResult] = useState(true);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadOcrResult() {
      setIsLoadingOcrResult(true);
      setOcrErrorMessage(null);

      try {
        const selectedOcrResult = await getDocumentOcrResult(documentId);

        if (shouldUpdateState) {
          setOcrResult(selectedOcrResult);
        }
      } catch (error) {
        if (shouldUpdateState) {
          setOcrErrorMessage(getErrorMessage(error, "Unable to load OCR result."));
        }
      } finally {
        if (shouldUpdateState) {
          setIsLoadingOcrResult(false);
        }
      }
    }

    void loadOcrResult();

    return () => {
      shouldUpdateState = false;
    };
  }, [documentId]);

  return {
    isLoadingOcrResult,
    ocrErrorMessage,
    ocrResult,
    setOcrResult,
  };
}
