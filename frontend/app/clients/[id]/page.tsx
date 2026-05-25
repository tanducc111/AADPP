import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ClientCompanyDetailPageContent } from "@/components/clients/ClientCompanyDetailPageContent";

type ClientCompanyDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientCompanyDetailPage({ params }: ClientCompanyDetailPageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <ClientCompanyDetailPageContent clientCompanyId={id} />
    </ProtectedRoute>
  );
}
