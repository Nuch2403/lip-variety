import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import ImageUploader from "@/features/admin/components/ImageUploader.jsx";
import MiniToast from "@/features/admin/components/MiniToast.jsx";
import ConfirmModal from "@/features/admin/components/ConfirmModal.jsx";

function safeInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function getCodeValidationMessage(code) {
  const trimmed = String(code || "").trim();
  if (!trimmed) return "กรุณากรอก code";

  const hasUppercase = /[A-Z]/.test(trimmed);
  const invalidChars = [...new Set((trimmed.match(/[^a-z0-9-]/g) || []).filter((ch) => !/[A-Z]/.test(ch)))];

  if (!hasUppercase && invalidChars.length === 0) return null;

  const reasons = [];
  if (hasUppercase) {
    const uppers = [...new Set(trimmed.match(/[A-Z]/g) || [])].join(", ");
    reasons.push(`มีตัวพิมพ์ใหญ่ (${uppers})`);
  }
  if (invalidChars.length > 0) {
    const shown = invalidChars.map((ch) => (ch === " " ? "space" : ch)).join(", ");
    reasons.push(`มีอักขระที่ไม่อนุญาต (${shown})`);
  }

  return `code รูปแบบไม่ถูกต้อง: ${reasons.join(" และ ")}. ใช้ได้เฉพาะ a-z, 0-9 และขีดกลาง (-)`;
}

const blank = () => ({
  code: "",
  slug: "",
  name_th: "",
  name_en: "",
  short_desc_th: "",
  short_desc_en: "",
  image_path: "",
  sort_order: 0,
  is_published: true,
});

export default function LipTypeEditor() {
  const { code } = useParams();
  const isNew = code === "new";
  const nav = useNavigate();

  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const [origSlug, setOrigSlug] = useState("");
  const [form, setForm] = useState(blank());
  const [initialForm, setInitialForm] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, message: "", onConfirm: null });

  // custom prompt state
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptMessage] = useState("มีการแก้ไขที่ยังไม่ได้บันทึก");
  const pendingActionRef = useRef(null);
  const allowNavRef = useRef(false);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    const normalize = (obj) => ({
      ...obj,
      code: (obj.code || "").trim(),
      slug: (obj.slug || "").trim(),
      name_th: (obj.name_th || "").trim(),
      name_en: (obj.name_en || "").trim(),
      short_desc_th: obj.short_desc_th || "",
      short_desc_en: obj.short_desc_en || "",
      image_path: obj.image_path || "",
      sort_order: Number(obj.sort_order) || 0,
      is_published: !!obj.is_published,
    });
    return JSON.stringify(normalize(initialForm)) !== JSON.stringify(normalize(form));
  }, [form, initialForm]);

  const previewUrl = useMemo(() => (form.slug ? `/type/${form.slug}` : ""), [form.slug]);

  // Intercept link clicks
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

  // Intercept browser back/forward
  useEffect(() => {
    if (!isDirty) return;
    const onPop = (e) => {
      if (allowNavRef.current) {
        allowNavRef.current = false;
        return;
      }
      e.preventDefault();
      // cancel the navigation by pushing forward
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

  useEffect(() => {
    let alive = true;

    (async () => {
      if (isNew) {
        if (!alive) return;
        const seed = blank();
        setForm(seed);
        setInitialForm(seed);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("lip_types")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error) {
        console.error(error);
        setToast(error.message || "โหลดข้อมูลไม่สำเร็จ");
      }

      if (!alive) return;
      if (data) {
        const normalized = {
          code: data.code ?? "",
          slug: data.slug ?? "",
          name_th: data.name_th ?? "",
          name_en: data.name_en ?? "",
          short_desc_th: data.short_desc_th ?? "",
          short_desc_en: data.short_desc_en ?? "",
          image_path: data.image_path ?? "",
          sort_order: safeInt(data.sort_order, 0),
          is_published: !!data.is_published,
        };
        setOrigSlug(data.slug || "");
        setForm(normalized);
        setInitialForm(normalized);
      }
      setLoading(false);
    })();

    return () => { alive = false; };
  }, [code, isNew]);

  function set(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function save(e) {
    e.preventDefault();

    // basic validation
    const codeTrim = form.code.trim();
    const codeError = getCodeValidationMessage(codeTrim);
    if (codeError) return setToast(codeError);
    if (!form.slug.trim()) return setToast("กรุณากรอกชื่อ URL");
    if (!form.name_th.trim()) return setToast("กรุณากรอกชื่อภาษาไทย");

    try {
      if (isNew) {
        const { data: existing, error: checkErr } = await supabase
          .from("lip_types")
          .select("code")
          .eq("code", codeTrim)
          .maybeSingle();
        if (checkErr && checkErr.code !== "PGRST116") throw checkErr;
        if (existing) return setToast("code นี้มีอยู่แล้ว");
      }

      // If slug changed, write redirect (old -> new)
      const slugChanged = !isNew && origSlug && form.slug && origSlug !== form.slug;
      if (slugChanged) {
        const { error: eRedir } = await supabase
          .from("slug_redirects")
          .upsert(
            { from_slug: origSlug, to_slug: form.slug, entity: "lip_type" },
            { onConflict: "from_slug" }
          );

        if (eRedir) {
          console.error(eRedir);
          return setToast("บันทึก slug redirect ไม่สำเร็จ: " + eRedir.message);
        }
      }

      if (isNew) {
        const { error } = await supabase.from("lip_types").insert({
          code: codeTrim,
          slug: form.slug.trim(),
          name_th: form.name_th.trim(),
          name_en: form.name_en.trim(),
          short_desc_th: form.short_desc_th.trim(),
          short_desc_en: form.short_desc_en.trim(),
          image_path: form.image_path || null,
          sort_order: safeInt(form.sort_order, 0),
          is_published: !!form.is_published,
        });
        if (error) throw error;

        setToast("สร้างประเภทลิปแล้ว");
        const normalized = {
          ...form,
          code: codeTrim,
          slug: form.slug.trim(),
          name_th: form.name_th.trim(),
          name_en: form.name_en.trim(),
          short_desc_th: form.short_desc_th.trim(),
          short_desc_en: form.short_desc_en.trim(),
          image_path: form.image_path || "",
          sort_order: safeInt(form.sort_order, 0),
          is_published: !!form.is_published,
        };
        setInitialForm(normalized);
        setForm(normalized);
        nav(`/admin/lip-types/${form.code.trim()}`, { replace: true });
      } else {
        const { error } = await supabase
          .from("lip_types")
          .update({
            slug: form.slug.trim(),
            name_th: form.name_th.trim(),
            name_en: form.name_en.trim(),
            short_desc_th: form.short_desc_th.trim(),
            short_desc_en: form.short_desc_en.trim(),
            image_path: form.image_path || null,
            sort_order: safeInt(form.sort_order, 0),
            is_published: !!form.is_published,
          })
          .eq("code", code);

        if (error) throw error;

        setOrigSlug(form.slug.trim());
        const normalized = {
          ...form,
          slug: form.slug.trim(),
          name_th: form.name_th.trim(),
          name_en: form.name_en.trim(),
          short_desc_th: form.short_desc_th.trim(),
          short_desc_en: form.short_desc_en.trim(),
          image_path: form.image_path || "",
          sort_order: safeInt(form.sort_order, 0),
          is_published: !!form.is_published,
        };
        setInitialForm(normalized);
        setForm(normalized);
        setToast("บันทึกแล้ว");
      }
    } catch (err) {
      console.error(err);
      setToast(err.message || "บันทึกไม่สำเร็จ");
    }
  }

  async function del() {
    if (isNew) return;
    setConfirmState({
      open: true,
      message: "ยืนยันลบประเภทลิปนี้หรือไม่?",
      onConfirm: async () => {
        const { error } = await supabase.from("lip_types").delete().eq("code", code);
        if (error) {
          setToast(error.message || "ลบไม่สำเร็จ");
        } else {
          setToast("ลบแล้ว");
          nav("/admin/lip-types", { replace: true });
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">{isNew ? "Create Lip Type" : "Edit Lip Type"}</div>
          <div className="text-sm text-zinc-600 mt-1">
            เปลี่ยนชื่อ URL (slug) แล้วระบบจะสร้าง redirect ให้ (จาก {origSlug || "—"} → {form.slug || "—"})
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link className="text-sm underline" to="/admin/lip-types">← Back</Link>
          {previewUrl ? (
            <a className="text-sm underline text-zinc-600" href={previewUrl} target="_blank" rel="noreferrer">
              View →
            </a>
          ) : null}
        </div>
      </div>

      <form className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]" onSubmit={save}>
        <div className="space-y-3">
          <div className="rounded-2xl border p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs text-zinc-600">code (PK)</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 font-mono text-sm"
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                  disabled={!isNew}
                  placeholder="e.g. matte"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">ชื่อ URL (unique)</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 font-mono text-sm"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="e.g. matte-lipstick"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">name_th</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.name_th}
                  onChange={(e) => set("name_th", e.target.value)}
                  placeholder="เช่น ลิปสติกเนื้อครีม"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">name_en</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.name_en}
                  onChange={(e) => set("name_en", e.target.value)}
                  placeholder="e.g. Creamy Lipstick"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">sort_order</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.sort_order}
                  onChange={(e) => set("sort_order", e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <label className="text-xs text-zinc-600">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={!!form.is_published}
                    onChange={(e) => set("is_published", e.target.checked)}
                  />
                  Published
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <label className="text-xs text-zinc-600">short_desc_th</label>
            <textarea
              className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[110px]"
              value={form.short_desc_th}
              onChange={(e) => set("short_desc_th", e.target.value)}
              placeholder="คำอธิบายสั้นสำหรับผู้ใช้ภาษาไทย"
            />

            <label className="text-xs text-zinc-600 mt-3 block">short_desc_en</label>
            <textarea
              className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[110px]"
              value={form.short_desc_en}
              onChange={(e) => set("short_desc_en", e.target.value)}
              placeholder="Short description in English"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-90">
              Save
            </button>
            {!isNew ? (
              <button
                type="button"
                className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                onClick={del}
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <ImageUploader
            label="Lip type image"
            folder={`lip-types/${form.slug || form.code || "unknown"}`}
            value={form.image_path}
            onChangePath={(p) => set("image_path", p)}
          />

          <div className="rounded-2xl border p-4 text-xs text-zinc-600 space-y-2">
            <div className="font-medium text-zinc-800">การทำงานของการ redirect ชื่อ URL</div>
            <div className="leading-relaxed">
              เมื่อมีการแก้ไขชื่อ URL (slug) ระบบจะทำงานอัตโนมัติ 2 ขั้นตอน:
            </div>
            <ol className="list-decimal list-inside space-y-1">
              <li>บันทึกการเปลี่ยนชื่อ: เก็บคู่ค่า <span className="font-mono">old → new</span> ลงตาราง <span className="font-mono">slug_redirects</span> เพื่อให้ลิงก์เดิมพาไป URL ใหม่</li>
              <li>อัปเดตข้อมูลหลัก: อัปเดต <span className="font-mono">lip_types.slug</span> ให้เป็นชื่อ URL ใหม่ เพื่อใช้เป็น URL มาตรฐานเดียว</li>
            </ol>
            <div className="leading-relaxed">
              ผลลัพธ์: ผู้ที่เข้า URL เก่าจะถูกพาไป URL ใหม่อัตโนมัติ ลิงก์เดิมไม่เสีย (ไม่เกิด 404) และระบบมี URL ใหม่เพียงหนึ่งเดียวเป็นมาตรฐาน
            </div>
          </div>
        </div>
      </form>

      <MiniToast message={toast} onClose={() => setToast("")} />
      <ConfirmModal
        open={confirmState.open}
        message={confirmState.message}
        onCancel={() => setConfirmState((s) => ({ ...s, open: false }))}
        onConfirm={confirmState.onConfirm}
        confirmText="ลบประเภทลิป"
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
