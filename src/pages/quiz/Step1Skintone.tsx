import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadQuiz, patchQuiz, track } from "@/features/quiz/model/quizStorage";

import paleSkin from "@/assets/pale-skin.webp";
import yellowSkin from "@/assets/yellow-skin.webp";
import mediumSkin from "@/assets/ผิวสองสี.jpg";
import tanSkin from "@/assets/สาวผิวแทน.jpg";
import deepSkin from "@/assets/ผิวเข้ม.jpg";

const OPTIONS = [
  { code: "fair",         label: "ผิวขาวซีด",    image: paleSkin,    desc: "ผิวขาวมาก โทนชมพูหรือซีด เห็นเส้นเลือดใต้ผิวค่อนข้างชัด" },
  { code: "light_yellow", label: "ผิวขาวเหลือง", image: yellowSkin,  desc: "ผิวขาวโทนเหลือง พบบ่อยในคนเอเชีย ดูสว่างแต่ไม่ซีด" },
  { code: "medium",       label: "ผิวสองสี",      image: mediumSkin,  desc: "ผิวกลาง ๆ ระหว่างขาวกับแทน โดนแดดแล้วผิวจะเข้มขึ้นง่าย" },
  { code: "tan",          label: "ผิวแทน",        image: tanSkin,     desc: "ผิวสีน้ำผึ้งหรือแทน โทนอุ่น ดูสุขภาพดี" },
  { code: "deep",         label: "ผิวเข้ม",       image: deepSkin,    desc: "ผิวสีน้ำตาลเข้มหรือช็อกโกแลต ไหม้แดดยาก" },
];

export default function Step1Skintone() {
  const nav = useNavigate();
  const [val, setVal] = useState("");

  useEffect(() => {
    const q = loadQuiz();
    if (!q.__started) {
      patchQuiz({ __started: true });
      track("start_quiz", { step: 1 });
    }
    track("step_change", { step: 1 });
    if (q.skintone?.code) setVal(q.skintone.code);
  }, []);

  const next = () => {
    if (!val) return;
    const picked = OPTIONS.find((o) => o.code === val);
    patchQuiz({ skintone: picked });
    nav("/quiz/step2-undertone");
  };

  return (
    <div className="container-page section">
      <span className="eyebrow">STEP 1/5</span>
      <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-ink mb-6">สีผิว (Skintone)</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OPTIONS.map((o) => (
          <label
            key={o.code}
            className={`card p-5 cursor-pointer transition ${val === o.code ? "card-selected" : "hover:shadow-md"}`}
          >
            <div className="flex items-start gap-4">
              <img src={o.image} alt={o.label} className="h-20 w-20 rounded-lg object-cover border border-berry/10" />
              <input
                type="radio"
                name="skintone"
                className="h-5 w-5 accent-berry mt-1"
                checked={val === o.code}
                onChange={() => setVal(o.code)}
              />
              <div>
                <span className="text-lg font-medium block text-ink">{o.label}</span>
                <p className="text-sm text-taupe mt-1 leading-snug">{o.desc}</p>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button className="btn-ghost" onClick={() => nav(-1)}>← ย้อนกลับ</button>
        <button className="btn-primary" disabled={!val} onClick={next}>ไปขั้นถัดไป</button>
      </div>
    </div>
  );
}
