"use client";

import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DocumentBreadcrumbs } from "@/components/documents/DocumentBreadcrumbs";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { runDocumentOcr } from "@/services/ocrService";
import { getErrorMessage } from "@/utils/getErrorMessage";

type DocumentOcrPageContentProps = {
  documentId: string;
};

export function DocumentOcrPageContent({ documentId }: DocumentOcrPageContentProps) {
  const router = useRouter();
  const hasStartedOcr = useRef(false);
  const [ocrErrorMessage, setOcrErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hasStartedOcr.current) {
      return;
    }

    hasStartedOcr.current = true;

    async function processDocumentOcr() {
      setOcrErrorMessage(null);

      try {
        await runDocumentOcr(documentId);
        toast.success("OCR completed.");
        router.replace(`${ROUTES.documents}/${documentId}/review`);
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Unable to run OCR.");
        setOcrErrorMessage(errorMessage);
        toast.error(errorMessage);
      }
    }

    void processDocumentOcr();
  }, [documentId, router]);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <DocumentBreadcrumbs
          breadcrumbs={[
            { label: "Documents", href: ROUTES.documents },
            { label: "Run OCR" },
          ]}
        />

        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto rounded-md bg-primary/10 p-3 text-primary">
              {ocrErrorMessage ? (
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
            <CardTitle className="mt-4">
              {ocrErrorMessage ? "OCR could not be completed" : "Running Gemini OCR"}
            </CardTitle>
            <CardDescription>
              {ocrErrorMessage
                ? "The document status was moved to failed. You can return to the document and try again."
                : "Gemini is extracting structured accounting data from the uploaded document."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {ocrErrorMessage ? (
              <div className="w-full rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {ocrErrorMessage}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Processing document...
              </div>
            )}
            <Button asChild type="button" variant="outline">
              <Link href={`${ROUTES.documents}/${documentId}`}>Back to Document</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
