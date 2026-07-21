import { useEffect, useMemo, useState } from "react";
import { loadQuiz } from "@/features/quiz/model/quizStorage";
import { fetchRecommendations } from "@/features/recommendations/api/fetchRecommendations";
import type { RecommendationRow } from "@/types/index";

const UNDERTONE_LABEL: Record<string, string> = { warm: "โทนอุ่น", cool: "โทนเย็น", neutral: "โทนกลาง" };
const DEPTH_LABEL: Record<string, string>     = { light: "สีอ่อน", medium: "สีกลาง", deep: "สีเข้ม" };
const COLOR_LABEL: Record<string, string>     = {
  red: "แดง", pink: "ชมพู", nude: "นูด", orange: "ส้ม",
  brown: "น้ำตาล", berry: "เบอร์รี่", coral: "คอรัล",
  peach: "พีช", fuchsia: "ฟุกเซีย",
};
const FINISH_LABEL: Record<string, string>    = {
  matte: "แมตต์", satin: "ซาติน", glossy: "กลอส", sheer: "เชียร์",
  metallic: "เมทัลลิก", cream: "ครีม", shimmer: "ชิมเมอร์",
};

export default function Results() {
  const [rows, setRows]         = useState<RecommendationRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [quiz]                  = useState(() => loadQuiz());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const top = await fetchRecommendations({ quiz, limit: 3 });
        setRows(top);
      } catch (e) {
        console.error("[Results] fetchRecommendations", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const title = useMemo(() => {
    const ut = quiz.undertone?.label ?? quiz.undertone?.code ?? "-";
    const sk = quiz.skintone?.label  ?? quiz.skintone?.code  ?? "-";
    return `ผลลัพธ์สำหรับ ${sk} × ${ut}`;
  }, []);

  const maxScore = rows[0]?._score || 1;

  function buildSearchText(r: RecommendationRow) {
    const brand = r.products?.brands?.name ?? "";
    const model = r.products?.model        ?? "";
    const shade = r.shade_name             ?? "";
    return `${brand} ${model} - ${shade}`.trim();
  }

  function searchUrl(r: RecommendationRow) {
    return `https://www.google.com/search?q=${encodeURIComponent(buildSearchText(r))}`;
  }

  return (
    <div className="container-page section">
      <span className="eyebrow">ผลลัพธ์ของคุณ</span>
      <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-ink mb-1">{title}</h1>
      <p className="mb-8 text-sm text-taupe">
        โอกาส: {quiz.occasions ?? "-"} • ความทนทาน: {quiz.durability ?? "-"}
      </p>

      {loading && <div className="text-ink/70">กำลังดึงข้อมูล…</div>}

      {!loading && rows.length === 0 && (
        <div className="rounded-xl border border-gold/30 bg-blush p-4 text-berry">
          ยังไม่พบเฉดที่เข้ากับโปรไฟล์ของคุณ ลองปรับคำตอบใหม่อีกครั้ง
        </div>
      )}

      <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {rows.map((r, i) => {
          const pct         = Math.round((r._score / maxScore) * 100);
          const finishKey   = (r.products?.finishes?.slug ?? r.products?.finish_tag ?? "").toLowerCase();
          const finishLabel = FINISH_LABEL[finishKey]    ?? null;
          const colorLabel  = COLOR_LABEL[r._family]     ?? null;
          const depthLabel  = DEPTH_LABEL[r.depth_tag]   ?? null;
          const utLabel     = UNDERTONE_LABEL[r.undertone_tag] ?? null;

          const badgeStyle =
            i === 0
              ? "h-11 w-11 text-lg bg-gold text-ink shadow-md ring-2 ring-white"
              : i === 1
              ? "h-8 w-8 text-sm bg-ink/80 text-cream"
              : "h-8 w-8 text-sm bg-ink/55 text-cream";

          return (
            <li
              key={r.id}
              className={`card overflow-hidden relative ${i === 0 ? "ring-2 ring-gold/40" : ""}`}
            >
              <span
                className={`absolute top-3 left-3 z-10 flex items-center justify-center rounded-full backdrop-blur font-display font-semibold ${badgeStyle}`}
              >
                {i + 1}
              </span>

              <div className="aspect-[4/5] bg-blush relative">
                {r._img ? (
                  <img src={r._img} alt={r.shade_name} className="h-full w-full object-cover" loading="lazy" />
                ) : null}
                {r.hex && (
                  <span
                    className="absolute bottom-3 right-3 h-9 w-9 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: r.hex }}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h3 className="font-display font-semibold text-ink truncate">{r.shade_name}</h3>

                  <a
                    href={searchUrl(r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 rounded-full border border-taupe/30 px-3 py-1 text-xs text-ink hover:bg-blush transition"
                    aria-label={`ค้นหา ${buildSearchText(r)}`}
                    title={buildSearchText(r)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    ค้นหา
                  </a>
                </div>

                <div className="text-sm text-taupe">
                  {r.products?.brands?.name} • {r.products?.model}
                </div>

                <div className="mt-3 h-1.5 w-full rounded-full bg-blush">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-berry to-gold" style={{ width: `${pct}%` }} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/70">
                  {utLabel     && <span className="rounded-full bg-blush px-2 py-0.5">{utLabel}</span>}
                  {depthLabel  && <span className="rounded-full bg-blush px-2 py-0.5">{depthLabel}</span>}
                  {colorLabel  && <span className="rounded-full bg-blush px-2 py-0.5">{colorLabel}</span>}
                  {finishLabel && <span className="rounded-full bg-blush px-2 py-0.5">{finishLabel}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
