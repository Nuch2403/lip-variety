import AdminGuard from "@/features/admin/AdminGuard";
import AdminShell from "@/features/admin/components/AdminShell";

export default function AdminLayout() {
  return (
    <AdminGuard>
      <AdminShell />
    </AdminGuard>
  );
}
