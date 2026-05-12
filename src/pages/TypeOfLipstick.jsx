import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toPublicUrl } from "@/lib/storage.js";
import { slugify } from "@/lib/slugify.js";

export default function TypeOfLipstickPage() {
  const [lipTypes, setLipTypes] = useState([]);
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
        setLipTypes(data || []);
      }
      setLoading(false);
    };

    fetchLipTypes();
  }, []);

  if (loading) {
    return (
      <div className="container-page py-10 text-center">
        กำลังโหลดประเภทลิปสติก...
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold mb-2">
        ประเภทลิปสติก (TYPE OF LIPSTICK)
      </h1>
      <p className="mb-6 text-zinc-600">
        เลือกประเภทลิปเพื่ออ่านรายละเอียดและคำแนะนำเบื้องต้น
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lipTypes.map((t) => {
          const slug = t.slug || slugify(t.name_en || t.name_th || String(t.code));
          const img = t.image_path ? toPublicUrl(t.image_path) : "";

          return (
            <Link
              key={t.code}
              to={`/type/${slug}`}
              className="group rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-[16/10] bg-zinc-100">
                {img ? (
                  <img
                    src={img}
                    alt={t.name_th || t.name_en}
                    className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                    loading="lazy"
                  />
                ) : null}
              </div>

              <div className="p-4">
                <div className="font-semibold">{t.name_th}</div>
                <div className="text-sm text-zinc-600">{t.name_en}</div>
                {t.short_desc_th ? (
                  <p className="mt-2 text-sm text-zinc-700 line-clamp-3">
                    {t.short_desc_th}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
