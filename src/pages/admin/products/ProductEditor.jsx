import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import ImageUploader from "@/features/admin/components/ImageUploader.jsx";
import MiniToast from "@/features/admin/components/MiniToast.jsx";
import ConfirmModal from "@/features/admin/components/ConfirmModal.jsx";

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const blankForm = {
  model: "",
  brand_id: "",
  type_tag: "",
  finish_id: "",
  longevity_tag: "",
  cover_image_path: "",
  is_discontinued: false,
};

export default function ProductEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [lipTypes, setLipTypes] = useState([]);
  const [finishes, setFinishes] = useState([]);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState(blankForm);
  const [initialForm, setInitialForm] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptMessage] = useState("มีการแก้ไขที่ยังไม่ได้บันทึก");
  const [confirmState, setConfirmState] = useState({ open: false, message: "", onConfirm: null });
  const pendingActionRef = useRef(null);
  const allowNavRef = useRef(false);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    const norm = (obj) => ({
      model: (obj.model || "").trim(),
      brand_id: obj.brand_id || "",
      type_tag: obj.type_tag || "",
      finish_id: obj.finish_id || "",
      longevity_tag: obj.longevity_tag || "",
      cover_image_path: obj.cover_image_path || "",
      is_discontinued: !!obj.is_discontinued,
    });
    return JSON.stringify(norm(initialForm)) !== JSON.stringify(norm(form));
  }, [form, initialForm]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    (async () => {
      const [{ data: brandData }, { data: typeData }, { data: finishData }] = await Promise.all([
        supabase.from("brands").select("id,name").order("name", { ascending: true }),
        supabase
          .from("lip_types")
          .select("code,name_th,name_en,sort_order")
          .order("sort_order", { ascending: true })
          .order("name_th", { ascending: true }),
        supabase
          .from("finishes")
          .select("id,name,slug,is_active")
          .eq("is_active", true)
          .order("name", { ascending: true }),
      ]);
      setBrands(brandData || []);
      setLipTypes(typeData || []);
      setFinishes(finishData || []);
    })();
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (isNew) {
        setInitialForm(blankForm);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) console.error(error);
      if (!alive) return;
      if (data) {
        const normalized = {
          model: data.model ?? "",
          brand_id: data.brand_id ?? "",
          type_tag: data.type_tag ?? "",
          finish_id: data.finish_id ?? "",
          finish_tag: data.finish_tag ?? "",
          longevity_tag: data.longevity_tag ?? "",
          cover_image_path: data.cover_image_path ?? "",
          is_discontinued: !!data.is_discontinued,
        };
        let mappedFinishId = normalized.finish_id || "";
        if (!mappedFinishId && normalized.finish_tag && finishes.length) {
          const match = finishes.find(
            (f) => (f.slug || "").trim().toLowerCase() === normalized.finish_tag.trim().toLowerCase()
          );
          if (match) mappedFinishId = match.id;
        }
        const nextForm = { ...normalized, finish_id: mappedFinishId, finish_tag: undefined };
        setForm(nextForm);
        setInitialForm(nextForm);
      }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [id, isNew, finishes]);

  useEffect(() => {
    if (!isDirty) return;
    const onClick = (e) => {
      if (allowNavRef.current) return;
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      const url = new URL(href, window.location.href);
      const sameOrigin = url.origin === window.location.origin;
      const samePath = url.pathname + url.search + url.hash === window.location.pathname + window.location.search + window.location.hash;
      if (sameOrigin && !samePath) {
        e.preventDefault();
        e.stopPropagation();
        pendingActionRef.current = () => {
          allowNavRef.current = true;
          window.location.href = url.href;
        };
        setShowPrompt(true);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const onPop = (e) => {
      if (allowNavRef.current) {
        allowNavRef.current = false;
        return;
      }
      e.preventDefault();
      history.go(1);
      pendingActionRef.current = () => {
        allowNavRef.current = true;
        history.back();
      };
      setShowPrompt(true);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [isDirty]);

  async function save(e) {
    e.preventDefault();
    if (!form.model.trim()) return setToast("กรุณากรอกชื่อรุ่นสินค้า");
    if (!form.brand_id) return setToast("กรุณาเลือกแบรนด์");

    const payload = {
      model: form.model.trim(),
      brand_id: toInt(form.brand_id),
      type_tag: form.type_tag || null,
      finish_id: form.finish_id || null,
      longevity_tag: form.longevity_tag.trim() || null,
      cover_image_path: form.cover_image_path || null,
      is_discontinued: !!form.is_discontinued,
    };

    try {
      if (isNew) {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        setToast("สร้างสินค้าแล้ว");
        const norm = {
          ...payload,
          brand_id: payload.brand_id || "",
          finish_id: payload.finish_id || "",
          cover_image_path: payload.cover_image_path || "",
        };
        setInitialForm(norm);
        setForm(norm);
        nav(`/admin/products/${data.id}`, { replace: true });
      } else {
        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) throw error;
        const norm = {
          ...payload,
          brand_id: payload.brand_id || "",
          finish_id: payload.finish_id || "",
          cover_image_path: payload.cover_image_path || "",
        };
        setInitialForm(norm);
        setForm(norm);
        setToast("บันทึกแล้ว");
      }
    } catch (err) {
      console.error(err);
      setToast(err.message || "บันทึกไม่สำเร็จ");
    }
  }

  function confirmDelete() {
    if (isNew) return;
    setConfirmState({
      open: true,
      message: "ยืนยันลบสินค้านี้หรือไม่?",
      onConfirm: async () => {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
          setToast(error.message || "ลบไม่สำเร็จ");
        } else {
          setToast("ลบแล้ว");
          nav("/admin/products", { replace: true });
        }
        setConfirmState((s) => ({ ...s, open: false }));
      },
    });
  }

  function proceedNavigation() {
    const fn = pendingActionRef.current;
    setShowPrompt(false);
    pendingActionRef.current = null;
    if (fn) fn();
  }

  function stayHere() {
    pendingActionRef.current = null;
    setShowPrompt(false);
  }

  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }));

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">{isNew ? "Create Product" : "Edit Product"}</div>
          <div className="text-sm text-zinc-600">Manage core fields + single cover image.</div>
        </div>
        <div className="flex items-center gap-2">
          <Link className="text-sm underline" to="/admin/products">← กลับรายการ</Link>
          {!isNew ? (
            <Link className="text-sm underline text-zinc-600" to={`/admin/shades?product=${id}`}>
              จัดการเฉดสี →
            </Link>
          ) : null}
        </div>
      </div>

      <form className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]" onSubmit={save}>
        <div className="space-y-3">
          <div className="rounded-2xl border p-4 space-y-3">
            <div>
              <label className="text-xs text-zinc-600">model</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.model}
                onChange={(e) => setField("model", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-600">brand</label>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.brand_id}
                onChange={(e) => setField("brand_id", e.target.value)}
                required
              >
                <option value="">Select brand...</option>
                {brandOptions.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-600">type_tag</label>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.type_tag}
                  onChange={(e) => setField("type_tag", e.target.value)}
                >
                  <option value="">Select type...</option>
                  {lipTypes.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.name_th || t.name_en || t.code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-600">finish</label>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.finish_id}
                  onChange={(e) => setField("finish_id", e.target.value)}
                >
                  <option value="">Select finish...</option>
                  {finishes.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.slug})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:col-span-2 items-end">
                <div>
                  <label className="text-xs text-zinc-600">longevity_tag</label>
                  <select
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    value={form.longevity_tag}
                    onChange={(e) => setField("longevity_tag", e.target.value)}
                  >
                    <option value="">ไม่ระบุ</option>
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 rounded-xl border px-3 py-2 bg-zinc-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-black"
                    checked={!!form.is_discontinued}
                    onChange={(e) => setField("is_discontinued", e.target.checked)}
                  />
                  <div className="leading-tight">
                    <div className="text-sm font-medium text-zinc-900">นำออกจากการแนะนำ</div>
                    <div className="text-[11px] text-zinc-500">(Discontinued)</div>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-90">Save</button>
            {!isNew ? (
              <button type="button" className="rounded-xl border px-4 py-2 text-sm" onClick={confirmDelete}>
                Delete
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <ImageUploader
            label="Product image"
            folder={`products/${form.model || id || "product"}`}
            value={form.cover_image_path}
            onChangePath={(p) => setField("cover_image_path", p)}
          />
        </div>
      </form>

      <MiniToast message={toast} onClose={() => setToast("")} />
      <ConfirmModal
        open={confirmState.open}
        message={confirmState.message}
        onCancel={() => setConfirmState((s) => ({ ...s, open: false }))}
        onConfirm={confirmState.onConfirm}
        confirmText="ลบสินค้า"
      />

      {showPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[360px] max-w-[90vw] rounded-2xl bg-white shadow-2xl border border-zinc-200 p-5">
            <div className="text-lg font-semibold text-zinc-900">{promptMessage}</div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50"
                onClick={stayHere}
              >
                อยู่ต่อ
              </button>
              <button
                className="rounded-full bg-zinc-900 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-black"
                onClick={proceedNavigation}
              >
                ออกจากหน้านี้
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}



