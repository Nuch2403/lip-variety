import AdminGuard from "@/features/admin/AdminGuard.jsx";
import AdminShell from "@/features/admin/components/AdminShell.jsx";

export default function AdminLayout() {
  return (
    <AdminGuard>
      <AdminShell />
    </AdminGuard>
  );
}
