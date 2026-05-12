import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

import img1 from "@/assets/hero1.jpg";
import img2 from "@/assets/hero2.jpg";
import img3 from "@/assets/hero3.jpg";

export default function Home() {
  const images = useMemo(() => [img1, img2, img3], []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduce) return;

    let id: ReturnType<typeof setInterval>;

    const start = () => {
      clearInterval(id);
      id = setInterval(() => {
        setIndex((i) => (i + 1) % images.length);
      }, 4000);
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
  }, [images.length]);

  return (
    <>
      <section className="hero">
        <div className="container-page section">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
                หา <span className="underline decoration-white/40">เฉดลิป</span> ที่ "ใช่"
                สำหรับคุณ ในไม่กี่คลิก
              </h1>
              <p className="mt-4 text-white/90 text-lg max-w-xl">
                ทำควิซสั้น ๆ แล้วรับคำแนะนำ <b>Top 3 เฉด/รุ่น</b> ที่เข้ากับสีผิว โทนผิว
                สภาพริมฝีปาก และโอกาสการใช้งานของคุณ
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link
                  to="/quiz/step1-skintone"
                  className="btn-primary text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl"
                >
                  เริ่มควิซเลย
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-white/20">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/10" />
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    loading={i === 0 ? "eager" : "lazy"}
                    className={[
                      "absolute inset-0 w-full h-full object-cover",
                      "transition-all duration-1000 ease-in-out",
                      i === index ? "opacity-100 scale-105" : "opacity-0 scale-100",
                    ].join(" ")}
                  />
                ))}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={[
                        "h-1.5 w-5 rounded-full transition",
                        i === index ? "bg-white" : "bg-white/40 hover:bg-white/60",
                      ].join(" ")}
                      aria-label={`ดูรูปที่ ${i + 1}`}
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
            <article className="card p-6 hover:shadow-lg transition">
              <h3 className="mt-2 text-xl font-semibold text-brand">ตรงใจตามสีผิว/โทน</h3>
              <p className="mt-2 text-zinc-600">
                ใช้ข้อมูล Skintone & Undertone เพื่อกรองเฉดที่ "ใช่" จริง ๆ
              </p>
            </article>
            <article className="card p-6 hover:shadow-lg transition">
              <h3 className="mt-2 text-xl font-semibold text-brand">เลือกได้ตามโอกาส</h3>
              <p className="mt-2 text-zinc-600">
                ชีวิตประจำวัน, การทำงานที่ทำงาน, งานปาร์ตี้, ออกไปเที่ยว, และวันหยุด
              </p>
            </article>
            <article className="card p-6 hover:shadow-lg transition">
              <h3 className="mt-2 text-xl font-semibold text-brand">เป็นมิตรกับริมฝีปาก</h3>
              <p className="mt-2 text-zinc-600">
                แนะนำฟินิช/สูตรที่เหมาะกับริมฝีปากแห้งหรือปกติ–ชุ่มชื้น
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
