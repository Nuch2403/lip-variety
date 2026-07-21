import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

interface ShadeRow {
  id: number;
  shade_name: string;
  shade_code?: string;
  hex?: string;
  undertone_tag?: string;
  depth_tag?: string;
  is_discontinued: boolean;
  product_id?: number;
  _product?: { id: number; model: string; brand_id?: number } | null;
  _brand?: { id: number; name: string } | null;
}

export default function ShadesList() {
  const [rows, setRows]   = useState<ShadeRow[]>([]);
  const [q, setQ]         = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const preselectProduct = searchParams.get("product") ?? "";

  async function load() {
    setLoading(true);
    const { data: shades, error } = await supabase
      .from("shades")
      .select("id,shade_name,shade_code,hex,undertone_tag,depth_tag,is_discontinued,product_id")
      .order("product_id", { ascending: true })
      .order("id", { ascending: true });
    if (error) console.error(error);

    const productIds = Array.from(new Set((shades ?? []).map((s: { product_id?: number }) => s.product_id).filter(Boolean)));
    let products: { id: number; model: string; brand_id?: number }[] = [];
    if (productIds.length) {
      const { data: p, error: eP } = await supabase.from("products").select("id,model,brand_id").in("id", productIds);
      if (eP) console.error(eP);
      products = (p as typeof products) ?? [];
    }

    const brandIds = Array.from(new Set(products.map((p) => p.brand_id).filter(Boolean)));
    let brands: { id: number; name: string }[] = [];
    if (brandIds.length) {
      const { data: b, error: eB } = await supabase.from("brands").select("id,name").in("id", brandIds);
      if (eB) console.error(eB);
      brands = (b as typeof brands) ?? [];
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const brandMap = new Map(brands.map((b) => [b.id, b]));

    const merged: ShadeRow[] = (shades ?? []).map((s: ShadeRow) => {
      const p = s.product_id ? (productMap.get(s.product_id) ?? null) : null;
      const b = p?.brand_id ? (brandMap.get(p.brand_id) ?? null) : null;
      return { ...s, _product: p, _brand: b };
    });

    setRows(merged);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      const productMatch = preselectProduct ? String(r.product_id) === preselectProduct : true;
      if (!productMatch) return false;
      if (!s) return true;
      const hay = [r.shade_name, r.shade_code, r.hex, r.undertone_tag, r.depth_tag, r._product?.model, r._brand?.name].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [rows, q, preselectProduct]);

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-display text-xl font-semibold text-ink">Shades</div>
          <div className="text-sm text-taupe">จัดการเฉดสีของสินค้า ระบุโทนสี และรูปตัวอย่างสี</div>
        </div>
        <Link to="/admin/shades/new" className="admin-btn-primary">+ Create</Link>
      </div>

      <input className="admin-input mt-4" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shade / product / brand / hex…" />

      {loading ? <div className="py-8 text-center text-sm text-taupe">Loading…</div> : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-taupe">
            <tr className="border-b border-berry/10">
              <th className="py-2 pr-3">Shade</th>
              <th className="py-2 pr-3">Hex</th>
              <th className="py-2 pr-3">Undertone</th>
              <th className="py-2 pr-3">Depth</th>
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 pr-3">Brand</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-berry/10">
                <td className="py-2 pr-3">
                  <div className="font-medium text-ink">{r.shade_name}</div>
                  {r.shade_code ? <div className="text-xs text-taupe font-mono">{r.shade_code}</div> : null}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 rounded-full border border-berry/10" style={{ background: r.hex ?? "#ccc" }} />
                    {r.hex ? <span className="font-mono text-xs text-taupe">{r.hex}</span> : null}
                  </div>
                </td>
                <td className="py-2 pr-3 font-mono text-xs text-taupe">{r.undertone_tag ?? ""}</td>
                <td className="py-2 pr-3 font-mono text-xs text-taupe">{r.depth_tag ?? ""}</td>
                <td className="py-2 pr-3 font-medium text-ink">{r._product?.model ?? ""}</td>
                <td className="py-2 pr-3 text-xs text-taupe">{r._brand?.name ?? ""}</td>
                <td className="py-2 pr-3 text-xs">
                  {r.is_discontinued
                    ? <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">discontinued</span>
                    : <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">active</span>}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <Link className="text-xs text-berry hover:underline" to={`/admin/shades/${r.id}`}>Edit</Link>
                    {r._product ? <Link className="text-xs text-taupe hover:underline" to={`/admin/products/${r._product.id}`}>Product →</Link> : null}
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length ? <tr><td colSpan={8} className="py-8 text-center text-taupe">No shades found</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
