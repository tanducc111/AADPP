import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DocumentDetailPageContent } from "@/components/documents/DocumentDetailPageContent";

type DocumentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <DocumentDetailPageContent documentId={id} />
    </ProtectedRoute>
  );
}
