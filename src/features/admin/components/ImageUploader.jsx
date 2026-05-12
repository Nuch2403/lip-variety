import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toPublicUrl, normalizePath } from "@/lib/storage.js";

function extOf(name) {
  const m = String(name || "").toLowerCase().match(/\.(png|jpg|jpeg|webp)$/);
  return m ? m[1] : "jpg";
}

export default function ImageUploader({
  label = "Upload image",
  folder = "admin",
  value, // path or url
  onChangePath, // (path)=>void
  bucket = "lip-images",
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = value ? toPublicUrl(value) : "";

  // Auto-normalize incoming values (e.g., when pasting a public URL)
  useEffect(() => {
    const normalized = normalizePath(value);
    if (normalized && normalized !== value) {
      onChangePath?.(normalized);
    }
  }, [value, onChangePath]);

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      const ext = extOf(file.name);
      const safeName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
      const path = `${folder}/${safeName}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        cacheControl: "3600",
      });

      if (error) throw error;
      onChangePath?.(path);
    } catch (err) {
      console.error("[ImageUploader] upload error:", err);
      setError(err.message || "อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function clear() {
    onChangePath?.("");
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">{label}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs rounded-full border px-3 py-1 hover:bg-zinc-50"
            onClick={clear}
          >
            Clear
          </button>
          <label className="text-xs rounded-full bg-zinc-900 text-white px-3 py-1 cursor-pointer">
            {busy ? "Uploading…" : "Choose file"}
            <input type="file" accept="image/*" className="hidden" onChange={onPick} />
          </label>
        </div>
      </div>

      {error ? <div className="mt-2 text-xs text-red-600">{error}</div> : null}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr]">
        <div className="aspect-square rounded-xl bg-zinc-100 overflow-hidden border">
          {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="text-xs text-zinc-600">
          <div className="font-mono break-all">{value || "—"}</div>
          <div className="mt-2 opacity-80">
            Saved as: <span className="font-mono">{folder}/…</span> in bucket{" "}
            <span className="font-mono">{bucket}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
