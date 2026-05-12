import { useEffect, useMemo, useState } from "react";
import { loadQuiz } from "@/features/quiz/model/quizStorage.js";
import { fetchRecommendations } from "@/features/recommendations/api/fetchRecommendations.js";

const UNDERTONE_LABEL = { warm: "โทนอุ่น", cool: "โทนเย็น", neutral: "โทนกลาง" };
const DEPTH_LABEL     = { light: "สีอ่อน", medium: "สีกลาง", deep: "สีเข้ม" };
const COLOR_LABEL     = {
  red: "แดง", pink: "ชมพู", nude: "นูด", orange: "ส้ม",
  brown: "น้ำตาล", berry: "เบอร์รี่", coral: "คอรัล",
  peach: "พีช", fuchsia: "ฟุกเซีย",
};
const FINISH_LABEL    = {
  matte: "แมตต์", satin: "ซาติน", glossy: "กลอส", sheer: "เชียร์",
  metallic: "เมทัลลิก", cream: "ครีม", shimmer: "ชิมเมอร์",
};

export default function Results() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [quiz]                = useState(() => loadQuiz());

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
    const ut = quiz.undertone?.label || quiz.undertone?.code || "-";
    const sk = quiz.skintone?.label  || quiz.skintone?.code  || "-";
    return `ผลลัพธ์สำหรับ ${sk} × ${ut}`;
  }, []);

  // normalize score relative to top result so top = 100%
  const maxScore = rows[0]?._score || 1;

  function buildSearchText(r) {
    const brand = r.products?.brands?.name || "";
    const model = r.products?.model        || "";
    const shade = r.shade_name             || "";
    return `${brand} ${model} - ${shade}`.trim();
  }

  async function copyName(r) {
    const text = buildSearchText(r);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(r.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedId(r.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  }

  return (
    <div className="container-page section">
      <h1 className="mb-1 text-xl font-semibold">{title}</h1>
      <p className="mb-6 text-sm text-zinc-600">
        โอกาส: {quiz.occasions || "-"} • ความทนทาน: {quiz.durability || "-"}
      </p>

      {loading && <div>กำลังดึงข้อมูล…</div>}

      {!loading && rows.length === 0 && (
        <div className="rounded-xl border bg-amber-50 p-4 text-amber-800">
          ยังไม่พบเฉดที่เข้ากับโปรไฟล์ของคุณ ลองปรับคำตอบใหม่อีกครั้ง
        </div>
      )}

      <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {rows.map((r, i) => {
          const pct         = Math.round((r._score / maxScore) * 100);
          const placeBadge  = ["🥇", "🥈", "🥉"][i] || `${i + 1}`;
          const isCopied    = copiedId === r.id;
          const finishKey   = (r.products?.finishes?.slug || r.products?.finish_tag || "").toLowerCase();
          const finishLabel = FINISH_LABEL[finishKey]    || null;
          const colorLabel  = COLOR_LABEL[r._family]     || null;
          const depthLabel  = DEPTH_LABEL[r.depth_tag]   || null;
          const utLabel     = UNDERTONE_LABEL[r.undertone_tag] || null;

          return (
            <li key={r.id} className="card overflow-hidden">
              <div className="aspect-[4/5] bg-zinc-100">
                {r._img ? (
                  <img
                    src={r._img}
                    alt={r.shade_name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>

              <div className="p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{placeBadge}</span>
                    {r.hex && (
                      <span
                        className="h-4 w-4 rounded-full border border-zinc-200 shrink-0"
                        style={{ backgroundColor: r.hex }}
                      />
                    )}
                    <h3 className="font-semibold truncate">{r.shade_name}</h3>
                  </div>

                  <button
                    className="shrink-0 rounded-full border px-3 py-1 text-xs hover:bg-zinc-50"
                    aria-label="คัดลอกชื่อสำหรับค้นหา"
                    title={buildSearchText(r)}
                    onClick={() => copyName(r)}
                  >
                    {isCopied ? "คัดลอกแล้ว!" : "คัดลอกชื่อ"}
                  </button>
                </div>

                <div className="text-sm text-zinc-600">
                  {r.products?.brands?.name} • {r.products?.model}
                </div>

                <div className="mt-3 h-2 w-full rounded-full bg-zinc-200">
                  <div
                    className="h-2 rounded-full bg-brand"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
                  {utLabel     && <span className="rounded-full bg-zinc-100 px-2 py-0.5">{utLabel}</span>}
                  {depthLabel  && <span className="rounded-full bg-zinc-100 px-2 py-0.5">{depthLabel}</span>}
                  {colorLabel  && <span className="rounded-full bg-zinc-100 px-2 py-0.5">{colorLabel}</span>}
                  {finishLabel && <span className="rounded-full bg-zinc-100 px-2 py-0.5">{finishLabel}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
