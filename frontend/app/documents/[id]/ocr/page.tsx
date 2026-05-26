import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DocumentOcrPageContent } from "@/components/documents/DocumentOcrPageContent";

type DocumentOcrPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DocumentOcrPage({ params }: DocumentOcrPageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <DocumentOcrPageContent documentId={id} />
    </ProtectedRoute>
  );
}
