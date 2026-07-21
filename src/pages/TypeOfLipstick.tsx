import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toPublicUrl } from "@/lib/storage";
import { slugify } from "@/lib/slugify";
import type { LipType } from "@/types/index";

export default function TypeOfLipstickPage() {
  const [lipTypes, setLipTypes] = useState<LipType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLipTypes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("lip_types")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error loading lip_types:", error);
        setLipTypes([]);
      } else {
        setLipTypes((data as LipType[]) ?? []);
      }
      setLoading(false);
    };

    fetchLipTypes();
  }, []);

  if (loading) {
    return <div className="container-page section text-center text-ink/70">กำลังโหลดประเภทลิปสติก...</div>;
  }

  return (
    <div className="container-page section">
      <span className="eyebrow">คลังความรู้</span>
      <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-ink mb-2">ประเภทลิปสติก</h1>
      <p className="mb-8 text-taupe">เลือกประเภทลิปเพื่ออ่านรายละเอียดและคำแนะนำเบื้องต้น</p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lipTypes.map((t) => {
          const slug = t.slug ?? slugify(t.name_en ?? t.name_th ?? String(t.code));
          const img = t.image_path ? toPublicUrl(t.image_path) : "";

          return (
            <Link
              key={t.code}
              to={`/type/${slug}`}
              className="group card overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-[16/10] bg-blush">
                {img ? (
                  <img
                    src={img}
                    alt={t.name_th ?? t.name_en}
                    className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <div className="font-semibold text-ink">{t.name_th}</div>
                <div className="text-sm text-taupe">{t.name_en}</div>
                {t.short_desc_th ? (
                  <p className="mt-2 text-sm text-ink/70 line-clamp-3">{t.short_desc_th}</p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
