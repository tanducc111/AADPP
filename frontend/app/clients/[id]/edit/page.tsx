import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ClientCompanyFormPageContent } from "@/components/clients/ClientCompanyFormPageContent";

type EditClientCompanyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditClientCompanyPage({ params }: EditClientCompanyPageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <ClientCompanyFormPageContent clientCompanyId={id} mode="edit" />
    </ProtectedRoute>
  );
}
