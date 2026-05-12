import { supabase } from "@/lib/supabaseClient";
import { resolveImage } from "@/lib/storage";
import { depthPref } from "@/features/recommendations/data/constants";
import { detectColorFamily, scoreRow } from "@/features/recommendations/model/scoring";
import type { QuizState, RecommendationRow, Shade, Product, Brand } from "@/types/index";

interface FetchOptions {
  quiz?: Partial<QuizState>;
  limit?: number;
}

export async function fetchRecommendations({ quiz, limit = 3 }: FetchOptions = {}): Promise<RecommendationRow[]> {
  const ut = quiz?.undertone?.code;
  const depths = depthPref[quiz?.skintone?.code ?? ""] ?? ["light", "medium", "deep"];

  async function qStrict() {
    return supabase
      .from("shades")
      .select("id,shade_name,hex,undertone_tag,depth_tag,is_discontinued,product_id")
      .eq("is_discontinued", false)
      .in("depth_tag", depths)
      .eq("undertone_tag", ut!);
  }

  async function qAllowNeutral() {
    return supabase
      .from("shades")
      .select("id,shade_name,hex,undertone_tag,depth_tag,is_discontinued,product_id")
      .eq("is_discontinued", false)
      .in("depth_tag", depths)
      .in("undertone_tag", [ut!, "neutral"]);
  }

  async function qDepthOnly() {
    return supabase
      .from("shades")
      .select("id,shade_name,hex,undertone_tag,depth_tag,is_discontinued,product_id")
      .eq("is_discontinued", false)
      .in("depth_tag", depths);
  }

  let shades: Shade[] = [];
  if (ut) {
    const { data, error } = await qStrict();
    if (error) console.error("[Results] shades strict", error);
    shades = (data as Shade[]) ?? [];
  }
  if (!shades.length && ut && ut !== "neutral") {
    const { data, error } = await qAllowNeutral();
    if (error) console.error("[Results] shades neutral", error);
    shades = (data as Shade[]) ?? [];
  }
  if (!shades.length) {
    const { data, error } = await qDepthOnly();
    if (error) console.error("[Results] shades depthOnly", error);
    shades = (data as Shade[]) ?? [];
  }

  if (!shades.length) return [];

  const productIds = Array.from(
    new Set(shades.map((r) => r.product_id).filter(Boolean))
  );

  const { data: products, error: eProd } = await supabase
    .from("products")
    .select("id,model,longevity_tag,brand_id,finish_id,finish_tag,finishes(name,slug),type_tag,cover_image_path,is_discontinued")
    .in("id", productIds)
    .eq("is_discontinued", false);

  if (eProd) console.error("[Results] products", eProd);
  const prodMap = new Map<number, Product>((products as unknown as Product[] ?? []).map((p) => [p.id, p]));

  const brandIds = Array.from(
    new Set((products as unknown as Product[] ?? []).map((p) => p.brand_id).filter(Boolean))
  );

  const { data: brands, error: eBrand } = await supabase
    .from("brands")
    .select("id,name,slug,logo_path")
    .in("id", brandIds);

  if (eBrand) console.error("[Results] brands", eBrand);
  const brandMap = new Map<number, Brand>((brands as Brand[] ?? []).map((b) => [b.id, b]));

  const composed: RecommendationRow[] = shades
    .filter((s) => prodMap.has(s.product_id!))
    .map((s) => {
      const p = prodMap.get(s.product_id!)!;
      const b = brandMap.get(p.brand_id) ?? null;
      const imgCandidate = p?.cover_image_path ?? "";

      const row: RecommendationRow = {
        ...s,
        products: p ? { ...p, brands: b } : null,
        _img: resolveImage(imgCandidate),
        _score: 0,
        _family: "nude",
      };

      row._score = scoreRow(row, quiz ?? {});
      row._family = detectColorFamily(row);

      return row;
    })
    .sort((a, b) => b._score - a._score);

  const seenProducts = new Set<number>();
  const deduped: RecommendationRow[] = [];
  for (const row of composed) {
    const pid = row.product_id;
    if (pid && seenProducts.has(pid)) continue;
    if (pid) seenProducts.add(pid);
    deduped.push(row);
    if (deduped.length >= limit) break;
  }
  return deduped;
}
