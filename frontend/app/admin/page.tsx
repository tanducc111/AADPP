import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminOverview } from "@/components/admin/AdminOverview";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminOverview />
    </ProtectedRoute>
  );
}
