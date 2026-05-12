// Scoring + color-family detection for Results (Round 4)
// Safe, self-contained implementation that matches constants.js

import {
  BASE_WEIGHTS,
  COLOR_FAMILIES,
  COLOR_KEYWORDS,
  SHADE_ALIASES,
  OCCASION_COLOR_BIAS,
  occDepthBias,
  FINISH_BIAS,
  depthPref,
} from "@/features/recommendations/data/constants.js";

function clampPos(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function normText(v) {
  return String(v || "").trim().toLowerCase();
}

export function detectColorFamily(row) {
  const raw = normText(row?.shade_name);
  if (!raw) return "nude";

  const aliased = SHADE_ALIASES[raw] || raw;

  for (const fam of COLOR_FAMILIES) {
    const regs = COLOR_KEYWORDS[fam] || [];
    if (regs.some((re) => re.test(aliased))) return fam;
  }

  for (const fam of COLOR_FAMILIES) {
    if (aliased.includes(fam)) return fam;
  }
  return "nude";
}

function longevityOk(longevityTag, desired) {
  const l = normText(longevityTag);
  const product = l === "high" ? 5 : l === "medium" ? 3 : 2;
  if (!desired) return false;

  if (desired >= 4) return product >= 5;
  if (desired >= 3) return product >= 3;
  return true;
}

export function scoreRow(row, quiz) {
  let score = 0;

  const ut = normText(quiz?.undertone?.code);
  const sk = normText(quiz?.skintone?.code);
  const occ = quiz?.occasions || "";
  const durability = Number(quiz?.durability);

  // undertone match
  const shadeUt = normText(row?.undertone_tag);
  if (ut && shadeUt) {
    if (shadeUt === ut) score += BASE_WEIGHTS.undertone_match;
    else if (shadeUt === "neutral" && ut !== "neutral")
      score += BASE_WEIGHTS.undertone_neutral_cross;
  }

  // depth match
  const depth = normText(row?.depth_tag);
  const allowedDepths = depthPref[sk] || [];
  if (depth && allowedDepths.includes(depth)) score += BASE_WEIGHTS.depth_match;

  // occasion × depth bias
  if (occ && depth && occDepthBias[occ] && occDepthBias[occ][depth]) {
    score += occDepthBias[occ][depth];
  }

  // durability preference
  if (Number.isFinite(durability) && BASE_WEIGHTS.durability[durability]) {
    const lon = row?.products?.longevity_tag;
    if (longevityOk(lon, durability)) score += BASE_WEIGHTS.durability[durability];
  }

  // color family bias
  const fam = detectColorFamily(row);
  if (occ && fam && OCCASION_COLOR_BIAS[occ] && OCCASION_COLOR_BIAS[occ][fam]) {
    score += OCCASION_COLOR_BIAS[occ][fam];
  }

  // finish bias
  const finish = normText(row?.products?.finishes?.slug || row?.products?.finish_tag);
  if (finish && FINISH_BIAS[finish]) {
    const fb = FINISH_BIAS[finish];
    if (fb.durability && Number.isFinite(durability) && durability >= 4)
      score += fb.durability;
    if (occ && fb[occ]) score += fb[occ];
  }

  return clampPos(score);
}
