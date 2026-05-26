import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DocumentUploadPageContent } from "@/components/documents/DocumentUploadPageContent";

export default function DocumentUploadPage() {
  return (
    <ProtectedRoute>
      <DocumentUploadPageContent />
    </ProtectedRoute>
  );
}
