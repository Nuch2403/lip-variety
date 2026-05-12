import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import MiniToast from "@/features/admin/components/MiniToast.jsx";

export default function FinishesList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("finishes")
      .select("id,name,slug,is_active,updated_at")
      .order("name", { ascending: true });
    if (error) console.error(error);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      String(r.name || "").toLowerCase().includes(s) ||
      String(r.slug || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  async function toggleActive(row) {
    const { error } = await supabase
      .from("finishes")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) return setToast(error.message || "ไม่สามารถบันทึกได้");
    setToast("บันทึกแล้ว");
    await load();
  }

  return (
    <div className="p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Finishes</div>
          <div className="text-sm text-zinc-600">
            จัดการฟินิชของสินค้า เลือกเปิด/ปิดการใช้งาน
          </div>
        </div>
        <Link
          to="/admin/finishes/new"
          className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-90"
        >
          + Create
        </Link>
      </div>

      <input
        className="w-full rounded-xl border px-3 py-2"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name / ชื่อ URL…"
      />

      {loading ? <div className="py-8 text-center text-sm text-zinc-500">Loading...</div> : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr className="border-b">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">ชื่อ URL</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Updated</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="py-2 pr-3 font-medium">{r.name}</td>
                <td className="py-2 pr-3 font-mono text-xs">{r.slug}</td>
                <td className="py-2 pr-3">
                  <button
                    className={[
                      "text-xs rounded-full border px-3 py-1",
                      r.is_active ? "bg-emerald-50 border-emerald-200" : "bg-zinc-50",
                    ].join(" ")}
                    onClick={() => toggleActive(r)}
                  >
                    {r.is_active ? "active" : "disabled"}
                  </button>
                </td>
                <td className="py-2 pr-3 text-xs text-zinc-500">
                  {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "—"}
                </td>
                <td className="py-2 pr-3">
                  <Link className="text-xs underline" to={`/admin/finishes/${r.id}`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  No finishes found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <MiniToast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
