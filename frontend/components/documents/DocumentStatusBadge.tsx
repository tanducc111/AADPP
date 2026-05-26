import { Badge } from "@/components/ui/badge";
import { getDocumentStatusLabel } from "@/constants/documents";
import { cn } from "@/lib/cn";
import type { DocumentStatus } from "@/types/documents";

type DocumentStatusBadgeProps = {
  status: DocumentStatus;
};

const statusClassNames: Record<DocumentStatus, string> = {
  UPLOADED: "border-sky-200 bg-sky-50 text-sky-700",
  PROCESSING: "border-amber-200 bg-amber-50 text-amber-700",
  OCR_DONE: "border-indigo-200 bg-indigo-50 text-indigo-700",
  REVIEWED: "border-violet-200 bg-violet-50 text-violet-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
};

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  return (
    <Badge className={cn("border", statusClassNames[status])} variant="outline">
      {getDocumentStatusLabel(status)}
    </Badge>
  );
}
