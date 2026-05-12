// Shared domain types for LipVariety

// ── Quiz ──────────────────────────────────────────────────────────────────────

export interface QuizOption {
  code: string
  label: string
  image?: string
  desc?: string
  hours?: string
}

export interface QuizState {
  skintone?: QuizOption
  undertone?: QuizOption
  lipCondition?: QuizOption
  occasions?: string
  durability?: number
  updatedAt?: number
  __started?: boolean
}

// ── Database rows ─────────────────────────────────────────────────────────────

export interface Brand {
  id: number
  name: string
  slug: string
  logo_path: string
}

export interface Finish {
  id: number
  name: string
  slug: string
  is_active?: boolean
}

export interface Product {
  id: number
  model: string
  brand_id: number
  finish_id: number
  finish_tag?: string
  type_tag: string
  longevity_tag: string
  cover_image_path: string
  is_discontinued: boolean
  status?: string
  brands?: Brand | null
  finishes?: Finish | null
}

export interface Shade {
  id: number
  product_id: number
  shade_name: string
  hex: string
  undertone_tag: string
  depth_tag: string
  is_discontinued: boolean
  image_url?: string
}

export interface ShadeImage {
  id: number
  shade_id: number
  url: string
  priority?: number | null
  created_at: string
  _src?: string
}

export interface LipType {
  id?: number
  code: string
  name_th?: string
  name_en?: string
  slug?: string
  short_desc_th?: string
  short_desc_en?: string
  image_path?: string
  cover_image_path?: string
  is_published?: boolean
  sort_order?: number
}

// ── Recommendation result ─────────────────────────────────────────────────────

export type ProductWithBrand = Product & { brands: Brand | null }

export interface RecommendationRow extends Shade {
  products: ProductWithBrand | null
  _img: string
  _score: number
  _family: string
}

// ── Scoring constants ─────────────────────────────────────────────────────────

export type ColorFamily =
  | 'red' | 'pink' | 'nude' | 'orange' | 'brown'
  | 'berry' | 'coral' | 'peach' | 'fuchsia'

export type DepthTag = 'light' | 'medium' | 'deep'
export type UndertoneTag = 'warm' | 'cool' | 'neutral'
export type LongevityTag = 'high' | 'medium' | 'low'
export type OccasionKey = 'Party' | 'Office' | 'Daily' | 'Leisure'
