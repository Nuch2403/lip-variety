import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import ImageUploader from "@/features/admin/components/ImageUploader";
import MiniToast from "@/features/admin/components/MiniToast";
import ConfirmModal from "@/features/admin/components/ConfirmModal";

interface BrandForm { name: string; slug: string; logo_path: string }
interface ConfirmState { open: boolean; message: string; onConfirm: (() => void) | null }

const blankForm: BrandForm = { name: "", slug: "", logo_path: "" };

export default function BrandEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const nav = useNavigate();

  const [loading, setLoading]         = useState(true);
  const [form, setForm]               = useState<BrandForm>(blankForm);
  const [initialForm, setInitialForm] = useState<BrandForm | null>(null);
  const [toast, setToast]             = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: "", onConfirm: null });
  const [showPrompt, setShowPrompt]   = useState(false);
  const promptMessage = "มีการแก้ไขที่ยังไม่ได้บันทึก";
  const pendingActionRef = useRef<(() => void) | null>(null);
  const allowNavRef = useRef(false);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    const norm = (obj: BrandForm) => ({ name: (obj.name || "").trim(), slug: (obj.slug || "").trim(), logo_path: obj.logo_path || "" });
    return JSON.stringify(norm(initialForm)) !== JSON.stringify(norm(form));
  }, [form, initialForm]);

  const set = (k: keyof BrandForm, v: string) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    let alive = true;
    (async () => {
      if (isNew) { setInitialForm(blankForm); setLoading(false); return; }
      const { data, error } = await supabase.from("brands").select("*").eq("id", id).maybeSingle();
      if (error) setToast(error.message ?? "โหลดข้อมูลไม่สำเร็จ");
      if (!alive) return;
      if (data) {
        const normalized: BrandForm = { name: data.name ?? "", slug: data.slug ?? "", logo_path: data.logo_path ?? "" };
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
    if (!form.name.trim()) return setToast("กรุณากรอกชื่อแบรนด์");
    if (!form.slug.trim()) return setToast("กรุณากรอกชื่อ URL");
    const payload = { name: form.name.trim(), slug: form.slug.trim(), logo_path: form.logo_path || null };
    if (isNew) {
      const { error } = await supabase.from("brands").insert(payload);
      if (error) return setToast(error.message ?? "บันทึกไม่สำเร็จ");
      const norm = { ...payload, logo_path: payload.logo_path ?? "" };
      setInitialForm(norm); setForm(norm); setToast("สร้างแบรนด์แล้ว");
      nav("/admin/brands", { replace: true });
    } else {
      const { error } = await supabase.from("brands").update(payload).eq("id", id);
      if (error) return setToast(error.message ?? "บันทึกไม่สำเร็จ");
      const norm = { ...payload, logo_path: payload.logo_path ?? "" };
      setInitialForm(norm); setForm(norm); setToast("บันทึกแล้ว");
    }
  }

  function del() {
    if (isNew) return;
    setConfirmState({
      open: true, message: "ยืนยันลบแบรนด์นี้หรือไม่?",
      onConfirm: async () => {
        const { error } = await supabase.from("brands").delete().eq("id", id);
        if (error) { setToast(error.message ?? "ลบไม่สำเร็จ"); }
        else { setToast("ลบแล้ว"); nav("/admin/brands", { replace: true }); }
        setConfirmState((s) => ({ ...s, open: false }));
      },
    });
  }

  function proceedNavigation() {
    const fn = pendingActionRef.current; setShowPrompt(false); pendingActionRef.current = null; if (fn) fn();
  }
  function stayHere() { pendingActionRef.current = null; setShowPrompt(false); }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">{isNew ? "Create Brand" : "Edit Brand"}</div>
        <Link className="text-sm underline" to="/admin/brands">← Back</Link>
      </div>

      <form className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]" onSubmit={save}>
        <div className="rounded-2xl border p-4 space-y-3">
          <div>
            <label className="text-xs text-zinc-600">name</label>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-zinc-600">ชื่อ URL</label>
            <input className="mt-1 w-full rounded-xl border px-3 py-2 font-mono" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            <p className="text-[11px] text-zinc-500 mt-1">เปลี่ยนชื่อ URL (slug) ได้ ระบบจะ redirect จากของเก่าไปใหม่ให้อัตโนมัติ</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm">Save</button>
            {!isNew ? <button type="button" className="rounded-xl border px-4 py-2 text-sm" onClick={del}>Delete</button> : null}
          </div>
        </div>

        <ImageUploader label="Brand logo" folder={`brands/${form.slug || "brand"}`} value={form.logo_path} onChangePath={(p) => set("logo_path", p)} />
      </form>

      <MiniToast message={toast} onClose={() => setToast("")} />
      <ConfirmModal open={confirmState.open} message={confirmState.message} onCancel={() => setConfirmState((s) => ({ ...s, open: false }))} onConfirm={confirmState.onConfirm!} confirmText="ลบแบรนด์" />

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
