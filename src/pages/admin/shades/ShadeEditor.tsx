import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import MiniToast from "@/features/admin/components/MiniToast";
import ConfirmModal from "@/features/admin/components/ConfirmModal";

interface ShadeForm {
  product_id: string | number; shade_name: string; shade_code: string;
  hex: string; undertone_tag: string; depth_tag: string; is_discontinued: boolean;
}
interface ConfirmState { open: boolean; message: string; onConfirm: (() => void) | null }

function toInt(v: unknown): number | null { const n = Number(v); return Number.isFinite(n) ? n : null; }

const blankForm: ShadeForm = {
  product_id: "", shade_name: "", shade_code: "",
  hex: "", undertone_tag: "", depth_tag: "", is_discontinued: false,
};

export default function ShadeEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const nav = useNavigate();

  const [products, setProducts] = useState<{ id: number; model: string }[]>([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: "", onConfirm: null });
  const [form, setForm]         = useState<ShadeForm>(blankForm);
  const [initialForm, setInitialForm] = useState<ShadeForm | null>(null);
  const [showPrompt, setShowPrompt]   = useState(false);
  const promptMessage = "มีการแก้ไขที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?";
  const pendingActionRef = useRef<(() => void) | null>(null);
  const allowNavRef = useRef(false);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    const norm = (obj: ShadeForm) => ({
      product_id: obj.product_id || "", shade_name: (obj.shade_name || "").trim(),
      shade_code: obj.shade_code || "", hex: obj.hex || "",
      undertone_tag: obj.undertone_tag || "", depth_tag: obj.depth_tag || "",
      is_discontinued: !!obj.is_discontinued,
    });
    return JSON.stringify(norm(initialForm)) !== JSON.stringify(norm(form));
  }, [form, initialForm]);

  const setField = <K extends keyof ShadeForm>(k: K, v: ShadeForm[K]) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("products").select("id,model").order("model", { ascending: true });
      if (error) console.error(error);
      setProducts((data as typeof products) ?? []);
    })();
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (isNew) { setInitialForm(blankForm); setLoading(false); return; }
      const { data, error } = await supabase.from("shades").select("*").eq("id", id).maybeSingle();
      if (error) console.error(error);
      if (!alive) return;
      if (data) {
        const normalized: ShadeForm = {
          product_id: data.product_id ?? "", shade_name: data.shade_name ?? "",
          shade_code: data.shade_code ?? "", hex: data.hex ?? "",
          undertone_tag: data.undertone_tag ?? "", depth_tag: data.depth_tag ?? "",
          is_discontinued: !!data.is_discontinued,
        };
        setForm(normalized); setInitialForm(normalized);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [id, isNew]);

  useEffect(() => {
    if (!isDirty) return;
    const onClick = (e: MouseEvent) => {
      if (allowNavRef.current) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      const url = new URL(href, window.location.href);
      if (url.origin === window.location.origin && url.pathname + url.search + url.hash !== window.location.pathname + window.location.search + window.location.hash) {
        e.preventDefault(); e.stopPropagation();
        pendingActionRef.current = () => { allowNavRef.current = true; window.location.href = url.href; };
        setShowPrompt(true);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const onPop = (e: PopStateEvent) => {
      if (allowNavRef.current) { allowNavRef.current = false; return; }
      e.preventDefault(); history.go(1);
      pendingActionRef.current = () => { allowNavRef.current = true; history.back(); };
      setShowPrompt(true);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [isDirty]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product_id) return setToast("กรุณาเลือกสินค้า");
    if (!form.shade_name.trim()) return setToast("กรุณากรอกชื่อเฉดสี");
    const payload = {
      product_id: toInt(form.product_id), shade_name: form.shade_name.trim(),
      shade_code: form.shade_code.trim() || null, hex: form.hex.trim() || null,
      undertone_tag: form.undertone_tag.trim() || null, depth_tag: form.depth_tag.trim() || null,
      is_discontinued: !!form.is_discontinued,
    };
    try {
      if (isNew) {
        const { data, error } = await supabase.from("shades").insert(payload).select("id").single();
        if (error) throw error;
        setToast("สร้างเฉดสีแล้ว");
        const norm = { ...payload, product_id: payload.product_id ?? "" } as ShadeForm;
        setInitialForm(norm); setForm(norm);
        nav(`/admin/shades/${data.id}`, { replace: true });
      } else {
        const { error } = await supabase.from("shades").update(payload).eq("id", id);
        if (error) throw error;
        const norm = { ...payload, product_id: payload.product_id ?? "" } as ShadeForm;
        setInitialForm(norm); setForm(norm); setToast("บันทึกแล้ว");
      }
    } catch (err) { console.error(err); setToast((err as Error).message ?? "บันทึกไม่สำเร็จ"); }
  }

  function del() {
    if (isNew) return;
    setConfirmState({
      open: true, message: "ยืนยันลบเฉดสีนี้หรือไม่?",
      onConfirm: async () => {
        const { error } = await supabase.from("shades").delete().eq("id", id);
        if (error) { setToast(error.message ?? "ลบไม่สำเร็จ"); }
        else { setToast("ลบแล้ว"); nav("/admin/shades", { replace: true }); }
        setConfirmState((s) => ({ ...s, open: false }));
      },
    });
  }

  function proceedNavigation() { const fn = pendingActionRef.current; setShowPrompt(false); pendingActionRef.current = null; if (fn) fn(); }
  function stayHere() { pendingActionRef.current = null; setShowPrompt(false); }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">{isNew ? "Create Shade" : "Edit Shade"}</div>
          <div className="text-sm text-zinc-600">Bind shade to product + undertone/depth tags</div>
        </div>
        <Link className="text-sm underline" to="/admin/shades">← Back</Link>
      </div>

      <form className="grid grid-cols-1 gap-4" onSubmit={save}>
        <div className="space-y-3 rounded-2xl border p-4">
          <div>
            <label className="text-xs text-zinc-600">product</label>
            <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.product_id} onChange={(e) => setField("product_id", e.target.value)} required>
              <option value="">Select product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.model}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-600">shade_name</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.shade_name} onChange={(e) => setField("shade_name", e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-zinc-600">shade_code</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.shade_code} onChange={(e) => setField("shade_code", e.target.value)} placeholder="optional" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-zinc-600">hex</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2 font-mono" value={form.hex} onChange={(e) => setField("hex", e.target.value)} placeholder="#RRGGBB" />
            </div>
            <div>
              <label className="text-xs text-zinc-600">Undertone</label>
              <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.undertone_tag} onChange={(e) => setField("undertone_tag", e.target.value)}>
                <option value="">Undertone</option>
                <option value="warm">warm</option>
                <option value="cool">cool</option>
                <option value="neutral">neutral</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-600">depth_tag</label>
              <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.depth_tag} onChange={(e) => setField("depth_tag", e.target.value)}>
                <option value="">Depth</option>
                <option value="light">light</option>
                <option value="medium">medium</option>
                <option value="deep">deep</option>
              </select>
            </div>
          </div>

          <label className="text-xs text-zinc-600 inline-flex items-center gap-2">
            <input type="checkbox" className="mr-2" checked={!!form.is_discontinued} onChange={(e) => setField("is_discontinued", e.target.checked)} />
            Discontinued
          </label>

          <div className="flex gap-2">
            <button className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm">Save</button>
            {!isNew ? <button type="button" className="rounded-xl border px-4 py-2 text-sm" onClick={del}>Delete</button> : null}
          </div>
        </div>
      </form>

      <MiniToast message={toast} onClose={() => setToast("")} />
      <ConfirmModal open={confirmState.open} message={confirmState.message} onCancel={() => setConfirmState((s) => ({ ...s, open: false }))} onConfirm={confirmState.onConfirm!} confirmText="ลบเฉดสี" />

      {showPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[360px] max-w-[90vw] rounded-2xl bg-white shadow-2xl border border-zinc-200 p-5">
            <div className="text-lg font-semibold text-zinc-900">{promptMessage}</div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50" onClick={stayHere}>อยู่ต่อ</button>
              <button className="rounded-full bg-zinc-900 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-black" onClick={proceedNavigation}>ออกจากหน้านี้</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
