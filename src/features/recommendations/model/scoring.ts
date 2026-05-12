import type { QuizState, RecommendationRow, ColorFamily } from "@/types/index";
import {
  BASE_WEIGHTS,
  COLOR_FAMILIES,
  COLOR_KEYWORDS,
  SHADE_ALIASES,
  OCCASION_COLOR_BIAS,
  occDepthBias,
  FINISH_BIAS,
  depthPref,
} from "@/features/recommendations/data/constants";

function clampPos(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function normText(v: unknown): string {
  return String(v || "").trim().toLowerCase();
}

export function detectColorFamily(row: Partial<RecommendationRow>): ColorFamily {
  const raw = normText(row?.shade_name);
  if (!raw) return "nude";

  const aliased = SHADE_ALIASES[raw] ?? raw;

  for (const fam of COLOR_FAMILIES) {
    const regs = COLOR_KEYWORDS[fam] ?? [];
    if (regs.some((re) => re.test(aliased))) return fam;
  }

  for (const fam of COLOR_FAMILIES) {
    if (aliased.includes(fam)) return fam;
  }
  return "nude";
}

function longevityOk(longevityTag: unknown, desired: number): boolean {
  const l = normText(longevityTag);
  const product = l === "high" ? 5 : l === "medium" ? 3 : 2;
  if (!desired) return false;
  if (desired >= 4) return product >= 5;
  if (desired >= 3) return product >= 3;
  return true;
}

export function scoreRow(row: Partial<RecommendationRow>, quiz: Partial<QuizState>): number {
  let score = 0;

  const ut = normText(quiz?.undertone?.code);
  const sk = normText(quiz?.skintone?.code);
  const occ = quiz?.occasions ?? "";
  const durability = Number(quiz?.durability);

  const shadeUt = normText(row?.undertone_tag);
  if (ut && shadeUt) {
    if (shadeUt === ut) score += BASE_WEIGHTS.undertone_match;
    else if (shadeUt === "neutral" && ut !== "neutral")
      score += BASE_WEIGHTS.undertone_neutral_cross;
  }

  const depth = normText(row?.depth_tag);
  const allowedDepths = depthPref[sk] ?? [];
  if (depth && allowedDepths.includes(depth as "light" | "medium" | "deep"))
    score += BASE_WEIGHTS.depth_match;

  const occKey = occ as keyof typeof occDepthBias;
  if (occ && depth && occDepthBias[occKey]) {
    const bias = occDepthBias[occKey][depth as "light" | "medium" | "deep"];
    if (bias) score += bias;
  }

  if (Number.isFinite(durability) && BASE_WEIGHTS.durability[durability]) {
    const lon = row?.products?.longevity_tag;
    if (longevityOk(lon, durability)) score += BASE_WEIGHTS.durability[durability];
  }

  const fam = detectColorFamily(row);
  const colorBiasMap = OCCASION_COLOR_BIAS[occKey];
  if (occ && fam && colorBiasMap) {
    const cb = colorBiasMap[fam];
    if (cb) score += cb;
  }

  const finish = normText(row?.products?.finishes?.slug ?? row?.products?.finish_tag);
  if (finish && FINISH_BIAS[finish]) {
    const fb = FINISH_BIAS[finish];
    if (fb.durability && Number.isFinite(durability) && durability >= 4)
      score += fb.durability;
    if (occ && fb[occ]) score += fb[occ];
  }

  return clampPos(score);
}
