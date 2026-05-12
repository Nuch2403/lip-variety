import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toPublicUrl } from "@/lib/storage.js";

function buildSlugCandidates(raw) {
  const s = String(raw || "").trim();

  // Always try exact first
  const out = new Set([s]);

  // Legacy short slugs -> canonical slugs in DB
  // creamy/matte/glossy/liquid -> <slug>-lipstick
  if (s && !s.includes("-") && ["creamy", "matte", "glossy", "liquid"].includes(s)) {
    out.add(`${s}-lipstick`);
  }

  // balm/liner -> lip-balm / lip-liner
  if (s === "balm") out.add("lip-balm");
  if (s === "liner") out.add("lip-liner");

  // extra tolerant (edge cases)
  if (s === "sheer-satin") out.add("sheer_satin");
  if (s === "sheer_satin") out.add("sheer-satin");

  return Array.from(out);
}

export default function TypeDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const candidates = useMemo(() => buildSlugCandidates(slug), [slug]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setNotFound(false);
      setMeta(null);

      try {
        // query with candidates (support old URL)
        const { data, error } = await supabase
          .from("lip_types")
          .select("*")
          .eq("is_published", true)
          .in("slug", candidates);

        if (error) {
          console.error("[TypeDetail] lip_types query error:", error);
          if (!alive) return;
          setNotFound(true);
          return;
        }

        const bySlug = new Map((data || []).map((r) => [r.slug, r]));
        const picked = candidates.map((c) => bySlug.get(c)).find(Boolean) || null;

        if (!alive) return;

        if (!picked) {
          // try slug_redirects fallback
          const { data: redir, error: redirErr } = await supabase
            .from("slug_redirects")
            .select("to_slug")
            .eq("entity", "lip_types")
            .eq("from_slug", slug)
            .maybeSingle();

          if (!alive) return;

          if (redir?.to_slug && !redirErr) {
            navigate(`/type/${redir.to_slug}`, { replace: true });
            return;
          }

          setNotFound(true);
          return;
        }

        setMeta(picked);

        // canonical redirect: if URL is legacy, replace to canonical slug in DB
        if (picked.slug && picked.slug !== slug) {
          navigate(`/type/${picked.slug}`, { replace: true });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug, candidates, navigate]);

  if (loading) {
    return <div className="container-page py-10 text-center">กำลังโหลด…</div>;
  }

  if (notFound || !meta) {
    return (
      <div className="container-page py-10">
        <div className="rounded-2xl border bg-amber-50 p-5 text-amber-900">
          <div className="font-semibold mb-1">ไม่พบข้อมูลประเภทลิป</div>
          <div className="text-sm opacity-90">
            URL: <span className="font-mono">{String(slug)}</span>
          </div>
        </div>

        <div className="mt-5">
          <Link className="underline" to="/type-of-lipstick">
            ← กลับไปหน้ารวมประเภทลิป
          </Link>
        </div>
      </div>
    );
  }

  const img = meta.image_path ? toPublicUrl(meta.image_path) : "";

  return (
    <div className="container-page py-10">
      <Link className="text-sm underline" to="/type-of-lipstick">
        ← กลับไปหน้ารวมประเภทลิป
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl overflow-hidden border bg-white">
          <div className="aspect-[16/10] bg-zinc-100">
            {img ? (
              <img
                src={img}
                alt={meta.name_th || meta.name_en}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : null}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{meta.name_th}</h1>
          <div className="text-zinc-600">{meta.name_en}</div>

          <div className="mt-4 space-y-3 text-zinc-800 leading-relaxed">
            {meta.short_desc_th ? (
              <p>{meta.short_desc_th}</p>
            ) : (
              <p className="text-zinc-600">
                ยังไม่มีรายละเอียดในส่วนข้อมูล (short_desc_th)
              </p>
            )}

            {meta.short_desc_en ? (
              <p className="text-sm text-zinc-600">{meta.short_desc_en}</p>
            ) : null}
          </div>

</div>
      </div>
    </div>
  );
}


