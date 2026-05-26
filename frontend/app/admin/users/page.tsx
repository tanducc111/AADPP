import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminUsersPageContent } from "@/components/admin/AdminUsersPageContent";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminUsersPageContent />
    </ProtectedRoute>
  );
}
