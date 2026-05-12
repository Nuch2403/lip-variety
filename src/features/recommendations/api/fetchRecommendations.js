// Query layer for Results (Round 4)
// Strategy: strict undertone+depth -> allow neutral -> depth only
// Then compose (shade + product + brand + image) and score.

import { supabase } from "@/lib/supabaseClient";
import { resolveImage } from "@/lib/storage.js";
import { depthPref } from "@/features/recommendations/data/constants.js";
import { detectColorFamily, scoreRow } from "@/features/recommendations/model/scoring.js";

export async function fetchRecommendations({ quiz, limit = 3 } = {}) {
  const ut = quiz?.undertone?.code;
  const depths = depthPref[quiz?.skintone?.code] || ["light", "medium", "deep"];

  async function qStrict() {
    return supabase
      .from("shades")
      .select(
        "id,shade_name,hex,undertone_tag,depth_tag,is_discontinued,product_id"
      )
      .eq("is_discontinued", false)
      .in("depth_tag", depths)
      .eq("undertone_tag", ut);
  }

  async function qAllowNeutral() {
    return supabase
      .from("shades")
      .select(
        "id,shade_name,hex,undertone_tag,depth_tag,is_discontinued,product_id"
      )
      .eq("is_discontinued", false)
      .in("depth_tag", depths)
      .in("undertone_tag", [ut, "neutral"]);
  }

  async function qDepthOnly() {
    return supabase
      .from("shades")
      .select(
        "id,shade_name,hex,undertone_tag,depth_tag,is_discontinued,product_id"
      )
      .eq("is_discontinued", false)
      .in("depth_tag", depths);
  }

  let shades = [];
  if (ut) {
    const { data, error } = await qStrict();
    if (error) console.error("[Results] shades strict", error);
    shades = data || [];
  }
  if (!shades.length && ut && ut !== "neutral") {
    const { data, error } = await qAllowNeutral();
    if (error) console.error("[Results] shades neutral", error);
    shades = data || [];
  }
  if (!shades.length) {
    const { data, error } = await qDepthOnly();
    if (error) console.error("[Results] shades depthOnly", error);
    shades = data || [];
  }

  if (!shades.length) return [];

  // Products
  const productIds = Array.from(
    new Set(shades.map((r) => r.product_id).filter(Boolean))
  );

  const { data: products, error: eProd } = await supabase
    .from("products")
    .select(
      "id,model,longevity_tag,brand_id,finish_id,finish_tag,finishes(name,slug),type_tag,cover_image_path,is_discontinued"
    )
    .in("id", productIds)
    .eq("is_discontinued", false);

  if (eProd) console.error("[Results] products", eProd);
  const prodMap = new Map((products || []).map((p) => [p.id, p]));

  // Brands
  const brandIds = Array.from(
    new Set((products || []).map((p) => p.brand_id).filter(Boolean))
  );

  const { data: brands, error: eBrand } = await supabase
    .from("brands")
    .select("id,name,slug,logo_path")
    .in("id", brandIds);

  if (eBrand) console.error("[Results] brands", eBrand);
  const brandMap = new Map((brands || []).map((b) => [b.id, b]));

  // Compose + score (skip shades whose product was filtered out)
  const composed = shades
    .filter((s) => prodMap.has(s.product_id))
    .map((s) => {
      const p = prodMap.get(s.product_id);
      const b = p ? brandMap.get(p.brand_id) : null;
      const imgCandidate = p?.cover_image_path || "";

      const row = {
        ...s,
        products: p ? { ...p, brands: b || null } : null,
        _img: resolveImage(imgCandidate),
      };

      row._score = scoreRow(row, quiz || {});
      row._family = detectColorFamily(row);

      return row;
    })
    .sort((a, b) => b._score - a._score);

  // Deduplicate: keep only best-scoring shade per product
  const seenProducts = new Set();
  const deduped = [];
  for (const row of composed) {
    const pid = row.product_id;
    if (pid && seenProducts.has(pid)) continue;
    if (pid) seenProducts.add(pid);
    deduped.push(row);
    if (deduped.length >= limit) break;
  }
  return deduped;
}
