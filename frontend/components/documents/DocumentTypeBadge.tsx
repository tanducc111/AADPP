import { Badge } from "@/components/ui/badge";
import { getDocumentTypeLabel } from "@/constants/documents";
import type { DocumentType } from "@/types/documents";

type DocumentTypeBadgeProps = {
  documentType: DocumentType;
};

export function DocumentTypeBadge({ documentType }: DocumentTypeBadgeProps) {
  return <Badge variant="secondary">{getDocumentTypeLabel(documentType)}</Badge>;
}
