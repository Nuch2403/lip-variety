import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import MiniToast from "@/features/admin/components/MiniToast";

interface FinishRow { id: number; name: string; slug: string; is_active: boolean; updated_at?: string }

export default function FinishesList() {
  const [rows, setRows]   = useState<FinishRow[]>([]);
  const [q, setQ]         = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("finishes")
      .select("id,name,slug,is_active,updated_at")
      .order("name", { ascending: true });
    if (error) console.error(error);
    setRows((data as FinishRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      String(r.name ?? "").toLowerCase().includes(s) ||
      String(r.slug ?? "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  async function toggleActive(row: FinishRow) {
    const { error } = await supabase.from("finishes").update({ is_active: !row.is_active }).eq("id", row.id);
    if (error) return setToast(error.message ?? "ไม่สามารถบันทึกได้");
    setToast("บันทึกแล้ว");
    await load();
  }

  return (
    <div className="p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-display text-xl font-semibold text-ink">Finishes</div>
          <div className="text-sm text-taupe">จัดการฟินิชของสินค้า เลือกเปิด/ปิดการใช้งาน</div>
        </div>
        <Link to="/admin/finishes/new" className="admin-btn-primary">
          + Create
        </Link>
      </div>

      <input
        className="admin-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name / ชื่อ URL…"
      />

      {loading ? <div className="py-8 text-center text-sm text-taupe">Loading...</div> : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-taupe">
            <tr className="border-b border-berry/10">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">ชื่อ URL</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Updated</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-berry/10">
                <td className="py-2 pr-3 font-medium text-ink">{r.name}</td>
                <td className="py-2 pr-3 font-mono text-xs text-taupe">{r.slug}</td>
                <td className="py-2 pr-3">
                  <button
                    className={["admin-pill", r.is_active ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-blush border-taupe/20 text-taupe"].join(" ")}
                    onClick={() => toggleActive(r)}
                  >
                    {r.is_active ? "active" : "disabled"}
                  </button>
                </td>
                <td className="py-2 pr-3 text-xs text-taupe">
                  {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "—"}
                </td>
                <td className="py-2 pr-3">
                  <Link className="text-xs text-berry hover:underline" to={`/admin/finishes/${r.id}`}>Edit</Link>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr><td colSpan={5} className="py-8 text-center text-taupe">No finishes found</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <MiniToast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
