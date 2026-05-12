import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import MiniToast from "@/features/admin/components/MiniToast";
import ConfirmModal from "@/features/admin/components/ConfirmModal";

interface FinishForm { name: string; slug: string; is_active: boolean }
interface ConfirmState { open: boolean; message: string; onConfirm: (() => void) | null }

const blankForm: FinishForm = { name: "", slug: "", is_active: true };

function slugOk(s: string) { return /^[a-z0-9-]+$/.test(s); }

export default function FinishEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const nav = useNavigate();

  const [form, setForm]               = useState<FinishForm>(blankForm);
  const [initialForm, setInitialForm] = useState<FinishForm | null>(null);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: "", onConfirm: null });
  const [showPrompt, setShowPrompt]   = useState(false);
  const promptMessage = "มีการแก้ไขที่ยังไม่ได้บันทึก";
  const pendingActionRef = useRef<(() => void) | null>(null);
  const allowNavRef = useRef(false);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    const norm = (obj: FinishForm) => ({ name: (obj.name || "").trim(), slug: (obj.slug || "").trim(), is_active: !!obj.is_active });
    return JSON.stringify(norm(initialForm)) !== JSON.stringify(norm(form));
  }, [form, initialForm]);

  const setField = <K extends keyof FinishForm>(k: K, v: FinishForm[K]) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    let alive = true;
    (async () => {
      if (isNew) { setInitialForm(blankForm); setForm(blankForm); setLoading(false); return; }
      const { data, error } = await supabase.from("finishes").select("*").eq("id", id).maybeSingle();
      if (error) console.error(error);
      if (!alive) return;
      if (data) {
        const normalized: FinishForm = { name: data.name ?? "", slug: data.slug ?? "", is_active: !!data.is_active };
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
    if (!form.name.trim()) return setToast("กรุณากรอกชื่อ");
    if (!form.slug.trim()) return setToast("กรุณากรอกชื่อ URL");
    if (!slugOk(form.slug.trim())) return setToast("ชื่อ URL ต้องเป็น a-z 0-9 และขีดกลาง (-)");
    const payload = { name: form.name.trim(), slug: form.slug.trim(), is_active: !!form.is_active };
    if (isNew) {
      const { error } = await supabase.from("finishes").insert(payload);
      if (error) return setToast(error.message ?? "บันทึกไม่สำเร็จ");
      setToast("สร้าง finish แล้ว"); setInitialForm(payload); setForm(payload);
      nav("/admin/finishes", { replace: true });
    } else {
      const { error } = await supabase.from("finishes").update(payload).eq("id", id);
      if (error) return setToast(error.message ?? "บันทึกไม่สำเร็จ");
      setInitialForm(payload); setForm(payload); setToast("บันทึกแล้ว");
    }
  }

  function del() {
    if (isNew) return;
    setConfirmState({
      open: true, message: "ยืนยันลบ finish นี้หรือไม่? (แนะนำให้ปิดการใช้งานแทน)",
      onConfirm: async () => {
        const { error } = await supabase.from("finishes").delete().eq("id", id);
        if (error) { setToast(error.message ?? "ลบไม่สำเร็จ"); }
        else { setToast("ลบแล้ว"); nav("/admin/finishes", { replace: true }); }
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
        <div className="text-xl font-semibold">{isNew ? "Create Finish" : "Edit Finish"}</div>
        <Link className="text-sm underline" to="/admin/finishes">← Back</Link>
      </div>

      <form className="rounded-2xl border p-4 space-y-3" onSubmit={save}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-600">name</label>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.name} onChange={(e) => setField("name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-zinc-600">ชื่อ URL</label>
            <input className="mt-1 w-full rounded-xl border px-3 py-2 font-mono" value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="e.g. satin" />
            <p className="text-[11px] text-zinc-500 mt-1">ใช้ตัวพิมพ์เล็ก a-z 0-9 และขีดกลางเท่านั้น</p>
          </div>
          <label className="text-xs text-zinc-600 inline-flex items-center gap-2 mt-6 md:mt-7">
            <input type="checkbox" className="mr-2" checked={!!form.is_active} onChange={(e) => setField("is_active", e.target.checked)} />
            Active
          </label>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm">Save</button>
          {!isNew ? <button type="button" className="rounded-xl border px-4 py-2 text-sm" onClick={del}>Delete</button> : null}
        </div>
      </form>

      <MiniToast message={toast} onClose={() => setToast("")} />
      <ConfirmModal open={confirmState.open} message={confirmState.message} onCancel={() => setConfirmState((s) => ({ ...s, open: false }))} onConfirm={confirmState.onConfirm!} confirmText="ลบ finish" />

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
