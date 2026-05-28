"use client";

import { ClipboardCopy, Loader2, ScanLine, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runDocumentRegionOcr } from "@/services/ocrService";
import type {
  ExtensionRegionMessage,
  ExtensionRegionSelectionPayload,
  OcrRegionResult,
} from "@/types/ocrRegion";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatPercentage } from "@/utils/formatNumber";

type OcrRegionControllerProps = {
  documentId: string;
  previewElement: HTMLElement | null;
};

const MIN_SELECTION_SIZE_PX = 8;

export function OcrRegionController({
  documentId,
  previewElement,
}: OcrRegionControllerProps) {
  const [ocrRegionResult, setOcrRegionResult] = useState<OcrRegionResult | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isRunningRegionOcr, setIsRunningRegionOcr] = useState(false);

  const handleRegionSelection = useCallback(
    async (selectionPayload: ExtensionRegionSelectionPayload) => {
      if (!previewElement) {
        toast.error("Khung xem trước tài liệu chưa sẵn sàng.");
        return;
      }

      const regionRequestPayload = buildRegionRequestPayload(
        selectionPayload,
        previewElement.getBoundingClientRect(),
      );

      if (!regionRequestPayload) {
        toast.error("Hãy chọn một vùng nằm trong phần xem trước tài liệu.");
        return;
      }

      setIsRunningRegionOcr(true);

      try {
        const regionOcrResult = await runDocumentRegionOcr(documentId, regionRequestPayload);
        setOcrRegionResult(regionOcrResult);
        setIsResultOpen(true);
        toast.success("OCR vùng chọn đã hoàn tất.");
      } catch (error) {
        toast.error(getErrorMessage(error, "Không thể OCR vùng đã chọn."));
      } finally {
        setIsRunningRegionOcr(false);
      }
    },
    [documentId, previewElement],
  );

  useEffect(() => {
    function handleExtensionMessage(event: MessageEvent<unknown>) {
      if (event.source !== window || !isExtensionRegionMessage(event.data)) {
        return;
      }

      void handleRegionSelection(event.data.payload);
    }

    window.addEventListener("message", handleExtensionMessage);

    return () => {
      window.removeEventListener("message", handleExtensionMessage);
    };
  }, [handleRegionSelection]);

  function requestRegionSelection() {
    window.postMessage(
      {
        source: "aadpp-web-app",
        type: "AADPP_START_REGION_SELECTION",
      },
      window.location.origin,
    );
    toast.info("Kéo chuột trên tài liệu để chọn vùng OCR.");
  }

  async function copyRegionText() {
    if (!ocrRegionResult?.text) {
      return;
    }

    await navigator.clipboard.writeText(ocrRegionResult.text);
    toast.success("Đã sao chép nội dung OCR.");
  }

  return (
    <>
      <Button disabled={isRunningRegionOcr} onClick={requestRegionSelection} type="button" variant="outline">
        {isRunningRegionOcr ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ScanLine className="h-4 w-4" aria-hidden="true" />
        )}
        OCR vùng chọn
      </Button>

      {isResultOpen && ocrRegionResult ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <span className="section-label">OCR vùng chọn</span>
                <CardTitle className="mt-4 text-xl">Kết quả vùng đã chọn</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Độ tin cậy{" "}
                  {ocrRegionResult.confidenceScore === null
                    ? "chưa có"
                    : formatPercentage(ocrRegionResult.confidenceScore)}
                </p>
              </div>
              <Button
                aria-label="Đóng kết quả OCR vùng chọn"
                onClick={() => setIsResultOpen(false)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100">
                {ocrRegionResult.text || "Không phát hiện nội dung trong vùng đã chọn."}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button onClick={() => setIsResultOpen(false)} type="button" variant="outline">
                  Đóng
                </Button>
                <Button disabled={!ocrRegionResult.text} onClick={copyRegionText} type="button">
                  <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
                  Sao chép
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}

function buildRegionRequestPayload(
  selectionPayload: ExtensionRegionSelectionPayload,
  previewRect: DOMRect,
) {
  const selectionLeft = selectionPayload.x;
  const selectionTop = selectionPayload.y;
  const selectionRight = selectionPayload.x + selectionPayload.width;
  const selectionBottom = selectionPayload.y + selectionPayload.height;
  const intersectLeft = Math.max(selectionLeft, previewRect.left);
  const intersectTop = Math.max(selectionTop, previewRect.top);
  const intersectRight = Math.min(selectionRight, previewRect.right);
  const intersectBottom = Math.min(selectionBottom, previewRect.bottom);
  const width = intersectRight - intersectLeft;
  const height = intersectBottom - intersectTop;

  if (width < MIN_SELECTION_SIZE_PX || height < MIN_SELECTION_SIZE_PX) {
    return null;
  }

  return {
    x: Math.round(intersectLeft - previewRect.left),
    y: Math.round(intersectTop - previewRect.top),
    width: Math.round(width),
    height: Math.round(height),
    displayWidth: Math.round(previewRect.width),
    displayHeight: Math.round(previewRect.height),
    page: selectionPayload.page ?? 1,
  };
}

function isExtensionRegionMessage(rawMessage: unknown): rawMessage is ExtensionRegionMessage {
  if (!rawMessage || typeof rawMessage !== "object") {
    return false;
  }

  const candidateMessage = rawMessage as Partial<ExtensionRegionMessage>;

  return (
    candidateMessage.source === "aadpp-chrome-extension" &&
    candidateMessage.type === "AADPP_OCR_REGION_SELECTED" &&
    Boolean(candidateMessage.payload)
  );
}
