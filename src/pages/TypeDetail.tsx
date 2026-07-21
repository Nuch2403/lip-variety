import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toPublicUrl } from "@/lib/storage";
import type { LipType } from "@/types/index";

function buildSlugCandidates(raw: string | undefined): string[] {
  const s = String(raw ?? "").trim();
  const out = new Set([s]);

  if (s && !s.includes("-") && ["creamy", "matte", "glossy", "liquid"].includes(s)) {
    out.add(`${s}-lipstick`);
  }
  if (s === "balm") out.add("lip-balm");
  if (s === "liner") out.add("lip-liner");
  if (s === "sheer-satin") out.add("sheer_satin");
  if (s === "sheer_satin") out.add("sheer-satin");

  return Array.from(out);
}

export default function TypeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [meta, setMeta] = useState<LipType | null>(null);
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

        const bySlug = new Map<string, LipType>((data as LipType[] ?? []).map((r) => [r.slug!, r]));
        const picked = candidates.map((c) => bySlug.get(c)).find(Boolean) ?? null;

        if (!alive) return;

        if (!picked) {
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

        if (picked.slug && picked.slug !== slug) {
          navigate(`/type/${picked.slug}`, { replace: true });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [slug, candidates, navigate]);

  if (loading) return <div className="container-page section text-center text-ink/70">กำลังโหลด…</div>;

  if (notFound || !meta) {
    return (
      <div className="container-page section">
        <div className="rounded-xl border border-gold/30 bg-blush p-5 text-berry">
          <div className="font-semibold mb-1">ไม่พบข้อมูลประเภทลิป</div>
          <div className="text-sm opacity-90">URL: <span className="font-mono">{String(slug)}</span></div>
        </div>
        <div className="mt-5">
          <Link className="btn-ghost" to="/type-of-lipstick">← กลับไปหน้ารวมประเภทลิป</Link>
        </div>
      </div>
    );
  }

  const img = meta.image_path ? toPublicUrl(meta.image_path) : "";

  return (
    <div className="container-page section">
      <Link className="btn-ghost text-sm" to="/type-of-lipstick">← กลับไปหน้ารวมประเภทลิป</Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="aspect-[16/10] bg-blush">
            {img ? (
              <img
                src={img}
                alt={meta.name_th ?? meta.name_en}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : null}
          </div>
        </div>

        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">{meta.name_th}</h1>
          <div className="text-taupe">{meta.name_en}</div>

          <div className="mt-4 space-y-3 text-ink/80 leading-relaxed">
            {meta.short_desc_th ? (
              <p>{meta.short_desc_th}</p>
            ) : (
              <p className="text-taupe">ยังไม่มีรายละเอียดในส่วนข้อมูล (short_desc_th)</p>
            )}
            {meta.short_desc_en ? (
              <p className="text-sm text-taupe">{meta.short_desc_en}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
