// scripts/seed.mjs
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

// โหลด .env.admin ด้วย path แบบสัมพันธ์กับไฟล์นี้ และให้ override เสมอ
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.admin"), override: true });

// debug สั้น ๆ (ไม่พิมพ์ค่าจริง ปลอดภัย)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[seed] ENV NOT LOADED",
    { hasURL: !!process.env.SUPABASE_URL, hasSRK: !!process.env.SUPABASE_SERVICE_ROLE_KEY });
  process.exit(1);
} else {
  console.log("[seed] env loaded OK");
}

import { createClient } from "@supabase/supabase-js";
const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// helper: upsert แล้วพิมพ์ผลลัพธ์สั้น ๆ
async function upsert(table, rows, onConflict) {
  const { data, error, status } = await admin
    .from(table)
    .upsert(rows, { onConflict, ignoreDuplicates: false })
    .select();
  if (error) {
    console.error(`[${table}] upsert error:`, error);
    process.exit(1);
  }
  console.log(`[${table}] upsert ok (status ${status}) rows=${data?.length ?? 0}`);
  return data;
}

async function main() {
  console.log('Seeding…');

  // 0) references
  await upsert('finishes', [
    { name: 'Cream' }, { name: 'Matte' }, { name: 'Glossy' }, { name: 'Balm' }, { name: 'Stain' }
  ], 'name');

  await upsert('occasions', [
    { name: 'Daily' }, { name: 'Office' }, { name: 'Party' }, { name: 'Casual' },
    { name: 'Formal' }, { name: 'Date' }, { name: 'Evening' }, { name: 'Beach/Daytime' }
  ], 'name');

  const brandNames = [
    'Bobbi Brown','Bourjois','Burt’s Bees','Catrice','Chanel','Charlotte Tilbury',
    'Clarins','Clinique','Dior','Estée Lauder','Etude House','Fenty Beauty',
    'Huda Beauty','Innisfree','Lancôme','L’Oréal Paris','MAC','Maybelline',
    'NARS','NYX','Revlon','Shiseido','Sleek','The Saem','Tom Ford','Tony Moly','Yves Saint Laurent'
  ];
  await upsert('brands', brandNames.map(name => ({ name })), 'name');

  // 1) map ids we need
  const { data: finishes } = await admin.from('finishes').select('id,name');
  const { data: brands } = await admin.from('brands').select('id,name');
  const getFinishId = (n) => finishes.find(f => f.name === n)?.id;
  const getBrandId = (n) => brands.find(b => b.name === n)?.id;

  // 2) products (ตัวอย่างย่อ — ต่อด้วยชุดเต็มของคุณได้เลย)
  const prodRows = [
    ['Bobbi Brown','Crushed Lip Color','Cream'],
    ['Bourjois','Rouge Edition Velvet','Matte'],
    ['Chanel','Rouge Coco','Cream'],
    ['Yves Saint Laurent','Rouge Volupté Shine','Glossy'],
    ['MAC','Retro Matte Lipstick','Matte'],
    ['Maybelline','SuperStay Matte Ink','Stain'],
  ].map(([brand, model, finish]) => ({
    brand_id: getBrandId(brand),
    model,
    finish_id: getFinishId(finish),
    status: 'active'
  }));

  await upsert('products', prodRows, 'brand_id,model');

  // 3) fetch products for shade join
  const { data: products } = await admin
    .from('products').select('id, model, brand_id');

  const getProduct = (brandName, model) => {
    const bId = getBrandId(brandName);
    return products.find(p => p.brand_id === bId && p.model === model);
  };

  // 4) shades (ตัวอย่าง mapping heuristic)
  const shadeRows = [
    // brand, model, shade_name, color family, note (for depth)
    ['MAC','Retro Matte Lipstick','Chili','red','brick red'],
    ['Maybelline','SuperStay Matte Ink','Founder','red','deep red'],
    ['Yves Saint Laurent','Rouge Volupté Shine','Coral Incandescent','orange','coral'],
    ['Chanel','Rouge Coco','Mademoiselle','pink','rose nude'],
  ].map(([brand, model, shade, color, note]) => {
    // undertone heuristic
    const undertone =
      color === 'pink'   ? 'cool' :
      (color === 'orange' || color === 'brown') ? 'warm' :
      'neutral';
    const depth =
      /deep/i.test(note)     ? 'deep' :
      /(light|pale)/i.test(note) ? 'light' : 'medium';
    const product = getProduct(brand, model);
    return {
      product_id: product?.id,
      shade_name: shade,
      hex: null,
      undertone_tag: undertone,
      depth_tag: depth,
      image_url: null,
      is_discontinued: false
    };
  });

  await upsert('shades', shadeRows, 'product_id,shade_name');

  // 5) product_occasion (ตัวอย่าง)
  const { data: occs } = await admin.from('occasions').select('id,name');
  const getOccId = (n) => occs.find(o => o.name === n)?.id;

  const poMap = [
    ['MAC','Retro Matte Lipstick','Formal'],
    ['MAC','Retro Matte Lipstick','Date'],
    ['Maybelline','SuperStay Matte Ink','Daily'],
    ['Maybelline','SuperStay Matte Ink','Office'],
    ['Yves Saint Laurent','Rouge Volupté Shine','Beach/Daytime']
  ].map(([brand, model, occ]) => {
    const p = getProduct(brand, model);
    return { product_id: p?.id, occasion_id: getOccId(occ) };
  }).filter(x => x.product_id && x.occasion_id);

  // ใช้ upsert แบบ unique composite ได้ถ้าตั้ง constraint ไว้
  const { error: poErr } = await admin.from('product_occasion').upsert(poMap, { ignoreDuplicates: true });
  if (poErr) {
    console.error('[product_occasion] upsert error:', poErr);
    process.exit(1);
  }
  console.log('[product_occasion] upsert ok');

  console.log('Seed done ✅');
}

main().catch((e) => {
  console.error('Seed fatal error:', e);
  process.exit(1);
});
