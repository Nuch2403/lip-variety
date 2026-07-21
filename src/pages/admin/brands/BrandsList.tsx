import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toPublicUrl } from "@/lib/storage";

interface BrandRow { id: number; name: string; slug: string; logo_path?: string; updated_at?: string }

export default function BrandsList() {
  const [rows, setRows] = useState<BrandRow[]>([]);
  const [q, setQ]       = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("brands")
      .select("id,name,slug,logo_path,updated_at")
      .order("updated_at", { ascending: false });
    if (error) console.error(error);
    setRows((data as BrandRow[]) ?? []);
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

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-xl font-semibold text-ink">Brands</div>
          <div className="text-sm text-taupe mt-1">จัดการข้อมูลแบรนด์ที่ใช้เชื่อมกับสินค้าในระบบ</div>
        </div>
        <Link to="/admin/brands/new" className="admin-btn-primary">
          + Create
        </Link>
      </div>

      <input
        className="admin-input mt-4"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search…"
      />

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {filtered.map((b) => {
          const logo = b.logo_path ? toPublicUrl(b.logo_path) : "";
          return (
            <Link key={b.id} to={`/admin/brands/${b.id}`} className="admin-panel p-4 hover:shadow-md transition block">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg border border-berry/10 bg-blush overflow-hidden">
                  {logo ? <img src={logo} className="h-full w-full object-cover" alt="" /> : null}
                </div>
                <div className="font-medium text-ink">{b.name}</div>
              </div>
            </Link>
          );
        })}
      </div>
      {!filtered.length ? <div className="py-10 text-center text-sm text-taupe">No brands found</div> : null}
    </div>
  );
}
