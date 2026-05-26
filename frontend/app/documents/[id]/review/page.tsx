import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DocumentReviewPageContent } from "@/components/documents/DocumentReviewPageContent";

type DocumentReviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DocumentReviewPage({ params }: DocumentReviewPageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <DocumentReviewPageContent documentId={id} />
    </ProtectedRoute>
  );
}
