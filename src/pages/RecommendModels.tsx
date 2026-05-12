import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { resolveImage } from "@/lib/storage";

interface FinishOption { id: number; name: string; slug: string }
interface ProductRow {
  id: number;
  model: string;
  type_tag: string;
  finish_tag?: string;
  longevity_tag?: string;
  is_discontinued: boolean;
  cover_image_path?: string;
  finish_id?: number;
  finishes?: { id: number; name: string; slug: string } | null;
  brands?: { id: number; name: string; slug: string; logo_path: string } | null;
  shades?: { id: number }[];
  _img: string;
  _shadeCount: number;
}

export default function RecommendModels() {
  const [list, setList]           = useState<ProductRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState("");
  const [type, setType]           = useState("");
  const [finish, setFinish]       = useState("");
  const [longevity, setLongevity] = useState("");
  const [copiedId, setCopiedId]   = useState<number | null>(null);
  const [finishOptions, setFinishOptions] = useState<FinishOption[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("finishes")
        .select("id,name,slug")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) console.error(error);
      setFinishOptions((data as FinishOption[]) ?? []);
    })();
  }, []);

  async function fetchData() {
    setLoading(true);
    setErr("");
    try {
      let q = supabase
        .from("products")
        .select(`id, model, type_tag, finish_tag, longevity_tag, is_discontinued, cover_image_path, finish_id, finishes ( id, name, slug ), brands ( id, name, slug, logo_path ), shades ( id )`)
        .eq("is_discontinued", false)
        .order("updated_at", { ascending: false });

      if (type) q = q.eq("type_tag", type);
      if (finish) q = q.eq("finish_id", finish);
      if (longevity) q = q.eq("longevity_tag", longevity);

      const { data, error } = await q.limit(60);
      if (error) {
        console.error("[RecommendModels] products query", error);
        setErr(error.message ?? "Query error");
        setList([]);
        return;
      }

      const normalized = (data ?? []).map((p: Record<string, unknown>) => ({
        ...(p as Omit<ProductRow, "_img" | "_shadeCount">),
        _img: resolveImage((p.cover_image_path as string) ?? ""),
        _shadeCount: ((p.shades as { id: number }[]) ?? []).length,
      })) as ProductRow[];

      setList(normalized);
    } catch (e) {
      console.error(e);
      setErr("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [type, finish, longevity]);

  const options = useMemo(() => {
    const types = new Set<string>();
    const longs = new Set<string>();
    for (const p of list) {
      if (p.type_tag) types.add(p.type_tag);
      if (p.longevity_tag) longs.add(p.longevity_tag);
    }
    return { types: Array.from(types).sort(), finishes: finishOptions, longevity: Array.from(longs).sort() };
  }, [list, finishOptions]);

  async function copyText(text: string, id: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    }
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold mb-2">รุ่นลิปสติกน่าใช้ — คัดให้แล้ว</h1>
      <p className="text-zinc-600 mb-6">เลือกดูรุ่นลิปจากข้อมูลในฐาน (read-only) และคัดลอกชื่อไปค้นหาได้ทันที</p>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select className="rounded-xl border px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">ทั้งหมด (Type)</option>
          {options.types.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select className="rounded-xl border px-3 py-2" value={finish} onChange={(e) => setFinish(e.target.value)}>
          <option value="">ทั้งหมด (Finish)</option>
          {options.finishes.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.slug})</option>)}
        </select>
        <select className="rounded-xl border px-3 py-2" value={longevity} onChange={(e) => setLongevity(e.target.value)}>
          <option value="">ทั้งหมด (Longevity)</option>
          {options.longevity.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {loading && <div>กำลังโหลด…</div>}
      {!loading && err && <div className="rounded-xl border bg-amber-50 p-4 text-amber-900">{err}</div>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {!loading && !err && list.map((p) => {
          const brand = p.brands?.name ?? "";
          const text = `${brand} ${p.model}`.trim();
          const isCopied = copiedId === p.id;

          return (
            <div key={p.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="aspect-video bg-zinc-100">
                {p._img ? <img src={p._img} alt={p.model} className="h-full w-full object-cover" loading="lazy" /> : null}
              </div>
              <div className="p-4">
                <div className="font-semibold">{p.model}</div>
                <div className="text-sm text-zinc-600">
                  {brand || "—"} • {p.type_tag}
                  {p.finishes?.name ? ` • ${p.finishes.name}` : p.finish_tag ? ` • ${p.finish_tag}` : ""}
                  {p.longevity_tag ? ` • ${p.longevity_tag}` : ""}
                </div>
                <div className="mt-2 text-xs text-zinc-500">จำนวนเฉด: {p._shadeCount}</div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    className="rounded-full border px-3 py-1 text-xs hover:bg-zinc-50"
                    onClick={() => copyText(text, p.id)}
                    title={text}
                  >
                    {isCopied ? "คัดลอกแล้ว!" : "คัดลอกชื่อ"}
                  </button>
                  <span className="text-xs text-zinc-400">id: {p.id}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
