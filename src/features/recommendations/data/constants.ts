import type { ColorFamily, OccasionKey, DepthTag } from "@/types/index";

export const depthPref: Record<string, DepthTag[]> = {
  fair: ["light", "medium"],
  light_yellow: ["light", "medium"],
  medium: ["medium"],
  tan: ["medium", "deep"],
  deep: ["deep"],
};

export const BASE_WEIGHTS = {
  undertone_match: 0.60,
  undertone_neutral_cross: 0.32,
  depth_match: 0.28,
  durability: { 4: 0.08, 3: 0.05, 2: 0.02 } as Record<number, number>,
};

export const occDepthBias: Record<OccasionKey, Record<DepthTag, number>> = {
  Party:   { deep: 0.30, medium: 0.15, light: 0.05 },
  Office:  { medium: 0.20, light: 0.10, deep: 0.05 },
  Daily:   { light: 0.20, medium: 0.10, deep: 0.05 },
  Leisure: { light: 0.15, medium: 0.15, deep: 0.10 },
};

export const COLOR_FAMILIES: ColorFamily[] = [
  "red", "pink", "nude", "orange", "brown", "berry", "coral", "peach", "fuchsia",
];

export const COLOR_KEYWORDS: Record<ColorFamily, RegExp[]> = {
  red:     [/red\b|ruby|cherry|crimson|scarlet/i],
  pink:    [/pink|rose|rosy|strawberry|mademoiselle|tokyo|istanbul|please me|pink veil|pink power/i],
  nude:    [/nude|seductress|tiramisu|blush(?!\s*berry)|velvet teddy|bare it all|attitude|fenty glow/i],
  orange:  [/orange|tangerine/i],
  brown:   [/brown|mocha|cocoa|chocolate|taupe|caramel|coffee|peach brown|rosy brown/i],
  berry:   [/berry|plum|wine|cranberry|raisin|burgundy/i],
  coral:   [/coral/i],
  peach:   [/peach(?!\s*brown)|latte/i],
  fuchsia: [/fuchsia/i],
};

export const SHADE_ALIASES: Record<string, ColorFamily> = {
  lover:          "pink",
  "please me":    "pink",
  "pink veil":    "pink",
  "nude embrace": "nude",
  "peach me":     "peach",
  tokyo:          "pink",
  istanbul:       "pink",
  "blush basin":  "nude",
  "velvet teddy": "nude",
  mademoiselle:   "pink",
  "fenty glow":   "nude",
};

export const OCCASION_COLOR_BIAS: Record<OccasionKey, Partial<Record<ColorFamily, number>>> = {
  Party:   { red: +0.28, berry: +0.22, fuchsia: +0.20, pink: +0.10, nude: +0.05, orange: +0.12, coral: +0.12, peach: +0.10, brown: +0.08 },
  Office:  { nude: +0.26, brown: +0.22, pink: +0.14, red: +0.10, coral: +0.08, peach: +0.08, orange: +0.05, berry: +0.05, fuchsia: +0.05 },
  Daily:   { pink: +0.24, peach: +0.18, coral: +0.16, nude: +0.14, orange: +0.12, red: +0.06, brown: +0.06, berry: +0.05, fuchsia: +0.05 },
  Leisure: { orange: +0.22, coral: +0.20, peach: +0.20, pink: +0.14, nude: +0.10, red: +0.10, brown: +0.08, berry: +0.06, fuchsia: +0.06 },
};

export const FINISH_BIAS: Record<string, Record<string, number>> = {
  matte:    { durability: +0.04, Office: +0.04, Party: +0.03 },
  satin:    { Office: +0.02, Daily: +0.01 },
  sheer:    { Daily: +0.02, Leisure: +0.03 },
  glossy:   { Leisure: +0.03, Daily: +0.02 },
  metallic: { Party: +0.04 },
  cream:    { Daily: +0.02, Leisure: +0.02 },
  shimmer:  { Party: +0.03, Leisure: +0.02 },
};
