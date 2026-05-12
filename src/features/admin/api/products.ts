import { supabase } from "@/lib/supabaseClient";
import { resolveImage, removePath } from "@/lib/storage";

interface ListAdminProductsOptions {
  q?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

interface AdminProductItem {
  id: number;
  brand: string;
  model: string;
  type: string;
  imgCount: number;
  preview: string;
}

interface ShadeImage {
  id: number;
  shade_id: number;
  url: string;
  priority?: number | null;
  created_at?: string;
  _src?: string;
}

export async function listAdminProducts({
  q = "",
  type = "",
  page = 1,
  pageSize = 24,
}: ListAdminProductsOptions = {}): Promise<{ items: AdminProductItem[]; total: number }> {
  let sel = supabase
    .from("products")
    .select("id, model, type_tag, brand_id, cover_image_path", { count: "exact" })
    .order("model", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (q?.trim()) sel = sel.ilike("model", `%${q.trim()}%`);
  if (type) sel = sel.eq("type_tag", type);

  const { data: products, error, count } = await sel;
  if (error) throw error;

  const brandIds = Array.from(
    new Set((products ?? []).map((p: { brand_id: number }) => p.brand_id).filter(Boolean))
  );

  const { data: brands, error: eBrand } = await supabase
    .from("brands")
    .select("id,name")
    .in("id", brandIds);
  if (eBrand) console.error("[AdminAPI] brands", eBrand);
  const brandMap = new Map<number, string>((brands ?? []).map((b: { id: number; name: string }) => [b.id, b.name]));

  const items: AdminProductItem[] = (products ?? []).map((p: { id: number; brand_id: number; model: string; type_tag: string; cover_image_path?: string }) => ({
    id: p.id,
    brand: brandMap.get(p.brand_id) ?? "-",
    model: p.model,
    type: p.type_tag,
    imgCount: p.cover_image_path ? 1 : 0,
    preview: resolveImage(p.cover_image_path ?? ""),
  }));

  return { items, total: count ?? 0 };
}

export async function getAdminProductEditorData(productId: number) {
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

  const dict: Record<number, (ShadeImage & { _src: string })[]> = {};
  for (const sh of s ?? []) {
    dict[sh.id] = (sh.shade_images as ShadeImage[] ?? [])
      .slice()
      .sort((a, b) => {
        const pa = a.priority ?? 9999;
        const pb = b.priority ?? 9999;
        if (pa !== pb) return pa - pb;
        return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      })
      .map((img) => ({ ...img, _src: resolveImage(img.url) }));
  }

  return {
    product: p,
    brand: p.brands ?? null,
    shades: s ?? [],
    imagesByShade: dict,
  };
}

export async function setShadeCover({ shadeId, imageId }: { shadeId: number; imageId: number }) {
  await supabase.from("shade_images").update({ priority: null }).eq("shade_id", shadeId);
  await supabase.from("shade_images").update({ priority: 0 }).eq("id", imageId);
}

export async function deleteShadeImage(img: { id: number; url: string }) {
  await removePath(img.url).catch(() => {});
  await supabase.from("shade_images").delete().eq("id", img.id);
}
