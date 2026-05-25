import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ClientCompanyFormPageContent } from "@/components/clients/ClientCompanyFormPageContent";

export default function NewClientCompanyPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <ClientCompanyFormPageContent mode="create" />
    </ProtectedRoute>
  );
}
