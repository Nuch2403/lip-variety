import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadQuiz, patchQuiz, track } from "@/features/quiz/model/quizStorage";

const OPTIONS = [
  { code: 2, label: "ติดทนน้อย",     hours: "ระยะเวลาติดทน 1–3 ชั่วโมง",  desc: "ต้องเติมบ่อย หลังรับประทานอาหาร" },
  { code: 3, label: "ติดทนปานกลาง", hours: "ระยะเวลาติดทน 3–6 ชั่วโมง",  desc: "ต้องเติมบ้าง โดยเฉพาะหลังรับประทานอาหารมันๆ" },
  { code: 4, label: "ติดทนนาน",     hours: "ระยะเวลาติดทน 6–12 ชั่วโมง", desc: "เม็ดสีแน่นติดทนนาน ไม่ต้องเติมบ่อย" },
];

export default function Step5Durability() {
  const nav = useNavigate();
  const [val, setVal] = useState<number | null>(null);

  useEffect(() => {
    track("step_change", { step: 5 });
    const q = loadQuiz();
    if (typeof q.durability === "number") setVal(q.durability);
  }, []);

  const next = () => {
    if (!val) return;
    patchQuiz({ durability: val });
    nav("/results");
  };

  return (
    <div className="container-page section">
      <span className="eyebrow">STEP 5/5</span>
      <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-ink mb-2">ความต้องการความติดทนของลิปสติก</h1>
      <p className="text-taupe mb-6">เลือกได้เพียง 1 ข้อ</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {OPTIONS.map((o) => {
          const active = val === o.code;
          return (
            <label
              key={o.code}
              className={`card flex gap-4 px-6 py-5 cursor-pointer transition ${active ? "card-selected" : "hover:shadow-md"}`}
            >
              <input
                type="radio"
                name="durability"
                className="h-5 w-5 mt-1 accent-berry"
                checked={active}
                onChange={() => setVal(o.code)}
                aria-label={o.label}
              />
              <div className="flex flex-col gap-1">
                <span className="text-lg font-medium text-ink">{o.label}</span>
                {o.hours && <span className="text-sm text-berry font-medium leading-snug">{o.hours}</span>}
                {o.desc  && <span className="text-sm text-taupe leading-snug">{o.desc}</span>}
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button className="btn-ghost" onClick={() => nav(-1)}>← ย้อนกลับ</button>
        <button className="btn-primary" disabled={!val} onClick={next}>ดูเฉดที่เหมาะกับฉัน</button>
      </div>
    </div>
  );
}
