import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ClientCompaniesPageContent } from "@/components/clients/ClientCompaniesPageContent";

export default function ClientCompaniesPage() {
  return (
    <ProtectedRoute>
      <ClientCompaniesPageContent />
    </ProtectedRoute>
  );
}
