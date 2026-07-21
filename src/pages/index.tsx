import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import carousel1 from "@/assets/carousel1.jpg";
import carousel2 from "@/assets/carousel2.jpg";
import carousel3 from "@/assets/carousel3.jpg";

const SLIDES = [
  { src: carousel1, alt: "ริมฝีปากทาลิปสติกสีแดงเนื้อกลอสเงางาม" },
  { src: carousel2, alt: "นางแบบสามคนถือลิปสีต่าง ๆ" },
  { src: carousel3, alt: "คอลเลกชันลิปสติกหลากหลายเฉดสี" },
];

export default function Home() {
  const slides = useMemo(() => SLIDES, []);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const prefersReduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduce || paused) return;

    let id: ReturnType<typeof setInterval>;

    const start = () => {
      clearInterval(id);
      id = setInterval(() => {
        setIndex((i) => (i + 1) % slides.length);
      }, 4500);
    };

    const onVis = () => {
      if (document.hidden) clearInterval(id);
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [slides.length, paused]);

  return (
    <>
      <section className="hero">
        <div className="container-page section">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
            <div>
              <span className="eyebrow">แบบทดสอบเฉดลิป 5 ขั้นตอน</span>
              <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold leading-[1.15] text-ink">
                หา<span className="text-berry">เฉดลิป</span>ที่ "ใช่"
                <br />สำหรับคุณ ในไม่กี่คลิก
              </h1>
              <p className="mt-5 text-ink/70 text-lg max-w-xl leading-relaxed">
                ทำควิซสั้น ๆ แล้วรับคำแนะนำ <b className="text-ink">Top 3 เฉด/รุ่น</b> ที่เข้ากับสีผิว โทนผิว
                สภาพริมฝีปาก และโอกาสการใช้งานของคุณ
              </p>
              <div className="mt-9 flex items-center gap-6">
                <Link
                  to="/quiz/step1-skintone"
                  className="btn-primary text-lg px-9 py-3"
                >
                  เริ่มควิซเลย
                </Link>
                <Link to="/type-of-lipstick" className="btn-ghost text-base">
                  ดูประเภทลิปสติก
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div
                className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-berry/10 shadow-[0_20px_50px_rgba(36,16,22,0.18)]"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
              >
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-ink/50 via-ink/0 to-ink/10" />

                {slides.map((slide, i) => (
                  <img
                    key={slide.src}
                    src={slide.src}
                    alt={slide.alt}
                    decoding="async"
                    loading={i === 0 ? "eager" : "lazy"}
                    className={[
                      "absolute inset-0 h-full w-full object-cover",
                      "transition-[opacity,transform] duration-[1400ms] ease-out motion-reduce:transition-none",
                      i === index ? "opacity-100 scale-100" : "opacity-0 scale-[1.08]",
                    ].join(" ")}
                  />
                ))}

                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setIndex(i);
                        setPaused(true);
                      }}
                      className={[
                        "h-1.5 rounded-full transition-all",
                        i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70",
                      ].join(" ")}
                      aria-label={`ดูภาพที่ ${i + 1} จาก ${slides.length}`}
                      aria-current={i === index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <div className="grid md:grid-cols-3 gap-6">
            <article className="card p-6 hover:shadow-md transition">
              <span className="inline-block h-2 w-10 rounded-full bg-berry mb-4" />
              <h3 className="text-xl font-semibold text-ink">ตรงใจตามสีผิว/โทน</h3>
              <p className="mt-2 text-ink/70 leading-relaxed">
                ใช้ข้อมูล Skintone &amp; Undertone เพื่อกรองเฉดที่ "ใช่" จริง ๆ
              </p>
            </article>
            <article className="card p-6 hover:shadow-md transition">
              <span className="inline-block h-2 w-10 rounded-full bg-gold mb-4" />
              <h3 className="text-xl font-semibold text-ink">เลือกได้ตามโอกาส</h3>
              <p className="mt-2 text-ink/70 leading-relaxed">
                ชีวิตประจำวัน, การทำงานที่ทำงาน, งานปาร์ตี้, ออกไปเที่ยว, และวันหยุด
              </p>
            </article>
            <article className="card p-6 hover:shadow-md transition">
              <span className="inline-block h-2 w-10 rounded-full bg-berry mb-4" />
              <h3 className="text-xl font-semibold text-ink">เป็นมิตรกับริมฝีปาก</h3>
              <p className="mt-2 text-ink/70 leading-relaxed">
                แนะนำฟินิช/สูตรที่เหมาะกับริมฝีปากแห้งหรือปกติ–ชุ่มชื้น
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
