import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toPublicUrl } from "@/lib/storage.js";
import MiniToast from "@/features/admin/components/MiniToast.jsx";

export default function LipTypesList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("lip_types")
      .select("code,slug,name_th,name_en,short_desc_th,sort_order,image_path,is_published,updated_at")
      .order("sort_order", { ascending: true });

    if (error) console.error(error);
    setRows(data || []);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      String(r.code).toLowerCase().includes(s) ||
      String(r.slug).toLowerCase().includes(s) ||
      String(r.name_th || "").toLowerCase().includes(s) ||
      String(r.name_en || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  async function togglePublish(row) {
    const { error } = await supabase
      .from("lip_types")
      .update({ is_published: !row.is_published })
      .eq("code", row.code);

    if (error) return setToast(error.message || "ไม่สามารถบันทึกได้");
    setToast("บันทึกแล้ว");
    await load();
  }

  async function swapOrder(a, b) {
    const updates = [
      { code: a.code, sort_order: b.sort_order },
      { code: b.code, sort_order: a.sort_order },
    ];
    for (const u of updates) {
      const { error } = await supabase
        .from("lip_types")
        .update({ sort_order: u.sort_order })
        .eq("code", u.code);
      if (error) return setToast(error.message || "ไม่สามารถสลับลำดับได้");
    }
    setToast("สลับลำดับแล้ว");
    await load();
  }

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Lip Types</div>
          <div className="text-sm text-zinc-600 mt-1">
            จัดการประเภทลิปสติก รวมถึงชื่อ รูปภาพ ลำดับการแสดงผล
          </div>
        </div>
        <Link
          to="/admin/lip-types/new"
          className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-90"
        >
          + Create
        </Link>
      </div>

      <div className="mt-4">
        <input
          className="w-full rounded-xl border px-3 py-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search code / ชื่อ URL / name…"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr className="border-b">
              <th className="py-2 pr-3">Order</th>
              <th className="py-2 pr-3">Image</th>
              <th className="py-2 pr-3">Code</th>
              <th className="py-2 pr-3">ชื่อ URL</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Published</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => {
              const img = r.image_path ? toPublicUrl(r.image_path) : "";
              const prev = filtered[idx - 1];
              const next = filtered[idx + 1];

              return (
                <tr key={r.code} className="border-b">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-xs">{r.sort_order ?? "—"}</div>
                      <div className="flex gap-1">
                        <button
                          className="text-xs rounded-full border px-2 py-1 hover:bg-zinc-50 disabled:opacity-30"
                          disabled={!prev}
                          onClick={() => prev && swapOrder(r, prev)}
                        >
                          ↑
                        </button>
                        <button
                          className="text-xs rounded-full border px-2 py-1 hover:bg-zinc-50 disabled:opacity-30"
                          disabled={!next}
                          onClick={() => next && swapOrder(r, next)}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 pr-3">
                    <div className="h-10 w-16 rounded-lg bg-zinc-100 overflow-hidden border">
                      {img ? <img src={img} className="h-full w-full object-cover" alt="" /> : null}
                    </div>
                  </td>

                  <td className="py-3 pr-3 font-mono text-xs">{String(r.code)}</td>
                  <td className="py-3 pr-3 font-mono text-xs">{r.slug}</td>
                  <td className="py-3 pr-3">
                    <div className="font-medium">{r.name_th}</div>
                    <div className="text-xs text-zinc-500">{r.name_en}</div>
                  </td>

                  <td className="py-3 pr-3">
                    <button
                      className={[
                        "text-xs rounded-full border px-3 py-1",
                        r.is_published ? "bg-emerald-50 border-emerald-200" : "bg-zinc-50",
                      ].join(" ")}
                      onClick={() => togglePublish(r)}
                    >
                      {r.is_published ? "Published" : "Draft"}
                    </button>
                  </td>

                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <Link className="text-xs underline" to={`/admin/lip-types/${r.code}`}>
                        Edit
                      </Link>
                      <a className="text-xs underline text-zinc-600" href={`/type/${r.slug}`} target="_blank" rel="noreferrer">
                        View →
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  No lip types found
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
