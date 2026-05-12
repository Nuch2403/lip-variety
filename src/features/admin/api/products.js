import { supabase } from "@/lib/supabaseClient";
import { resolveImage, removePath } from "@/lib/storage.js";

/**
 * Admin: list products with brand name + image count + preview image
 * Keeps the same output shape used by AdminModels UI.
 */
export async function listAdminProducts({
  q = "",
  type = "",
  page = 1,
  pageSize = 24,
} = {}) {
  let sel = supabase
    .from("products")
    .select("id, model, type_tag, brand_id", { count: "exact" })
    .order("model", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (q?.trim()) sel = sel.ilike("model", `%${q.trim()}%`);
  if (type) sel = sel.eq("type_tag", type);

  const { data: products, error, count } = await sel;
  if (error) throw error;

  const brandIds = Array.from(
    new Set((products || []).map((p) => p.brand_id).filter(Boolean))
  );

  // brands
  const { data: brands, error: eBrand } = await supabase
    .from("brands")
    .select("id,name")
    .in("id", brandIds);
  if (eBrand) console.error("[AdminAPI] brands", eBrand);
  const brandMap = new Map((brands || []).map((b) => [b.id, b.name]));

  const items = (products || []).map((p) => ({
    id: p.id,
    brand: brandMap.get(p.brand_id) || "-",
    model: p.model,
    type: p.type_tag,
    imgCount: p.cover_image_path ? 1 : 0,
    preview: resolveImage(p.cover_image_path),
  }));

  return { items, total: count || 0 };
}

/**
 * Admin: product editor page data (product+brand + shades + shade_images)
 * Keeps the same shape the UI already expects.
 */
export async function getAdminProductEditorData(productId) {
  const { data: p, error: pErr } = await supabase
    .from("products")
    .select("*, brands(*)")
    .eq("id", productId)
    .single();
  if (pErr) throw pErr;

  const { data: s, error: sErr } = await supabase
    .from("shades")
    .select("*, shade_images(*)")
    .eq("product_id", productId)
    .order("id", { ascending: true });
  if (sErr) throw sErr;

  const dict = {};
  for (const sh of s || []) {
    dict[sh.id] = (sh.shade_images || [])
      .slice()
      .sort((a, b) => {
        const pa = a.priority ?? 9999;
        const pb = b.priority ?? 9999;
        if (pa !== pb) return pa - pb;
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .map((img) => ({
        ...img,
        // เพิ่มฟิลด์ช่วย render (ไม่บังคับใช้ แต่ทำให้ UI ง่ายขึ้น)
        _src: resolveImage(img.url),
      }));
  }

  return {
    product: p,
    brand: p.brands || null,
    shades: s || [],
    imagesByShade: dict,
  };
}

export async function setShadeCover({ shadeId, imageId }) {
  await supabase.from("shade_images").update({ priority: null }).eq("shade_id", shadeId);
  await supabase.from("shade_images").update({ priority: 0 }).eq("id", imageId);
}

export async function deleteShadeImage(img) {
  // รองรับทั้ง path และ publicUrl (ข้อมูลเก่า)
  await removePath(img.url).catch(() => {});
  await supabase.from("shade_images").delete().eq("id", img.id);
}


