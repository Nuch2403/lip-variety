import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toPublicUrl } from "@/lib/storage.js";

export default function ProductsList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id,model,type_tag,finish_id,finish_tag,finishes(name,slug),brand_id,brands(name),is_discontinued,cover_image_path")
      .order("model", { ascending: true });
    if (error) console.error(error);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      String(r.model || "").toLowerCase().includes(s) ||
      String(r.type_tag || "").toLowerCase().includes(s) ||
      String(r.finish_tag || r.finishes?.slug || r.finishes?.name || "").toLowerCase().includes(s) ||
      String(r.brands?.name || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Products</div>
          <div className="text-sm text-zinc-600">
            จัดการรุ่นสินค้า รวมถึงข้อมูลหลัก รูปภาพสินค้า และการเชื่อมโยงกับเฉดสี
          </div>
        </div>
        <Link
          to="/admin/products/new"
          className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-90"
        >
          + Create
        </Link>
      </div>

      <input
        className="mt-4 w-full rounded-xl border px-3 py-2"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search model / type / finish…"
      />

      {loading ? (
        <div className="py-10 text-center text-sm text-zinc-500">Loading…</div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const cover = p.cover_image_path ? toPublicUrl(p.cover_image_path) : "";
          const brandName = p.brands?.name || "";
          return (
            <Link
              key={p.id}
              to={`/admin/products/${p.id}`}
              className="rounded-2xl border overflow-hidden bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="h-40 bg-zinc-100">
                {cover ? <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
              </div>
              <div className="p-4 space-y-1">
                <div className="font-semibold">
                  {brandName ? `${brandName} ${p.model}` : p.model}
                </div>
                <div className="text-xs text-zinc-600">
                  {p.type_tag || "—"} · {p.finishes?.name || p.finish_tag || "—"}
                </div>
                {p.is_discontinued ? (
                  <div className="text-[11px] inline-flex rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">
                    discontinued
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      {!loading && !filtered.length ? (
        <div className="py-10 text-center text-sm text-zinc-500">No products found</div>
      ) : null}
    </div>
  );
}

