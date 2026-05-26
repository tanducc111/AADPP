import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminActivityLogsPageContent } from "@/components/admin/AdminActivityLogsPageContent";

export default function AdminActivityLogsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminActivityLogsPageContent />
    </ProtectedRoute>
  );
}
