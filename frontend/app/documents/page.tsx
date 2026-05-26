import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DocumentsPageContent } from "@/components/documents/DocumentsPageContent";

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <DocumentsPageContent />
    </ProtectedRoute>
  );
}
