import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadQuiz, patchQuiz, track } from "@/features/quiz/model/quizStorage";

const OPTIONS = [
  { code: "Daily",   label: "ชีวิตประจำวัน" },
  { code: "Office",  label: "การทำงานหรือที่ทำงาน" },
  { code: "Party",   label: "งานปาร์ตี้ / โอกาสพิเศษ" },
  { code: "Leisure", label: "การออกไปเที่ยวหรือวันหยุด" },
];

export default function Step4Occasions() {
  const nav = useNavigate();
  const [val, setVal] = useState("");

  useEffect(() => {
    track("step_change", { step: 4 });
    const q = loadQuiz();
    if (typeof q.occasions === "string") setVal(q.occasions);
    else if (Array.isArray(q.occasions) && (q.occasions as string[]).length) setVal((q.occasions as string[])[0]);
  }, []);

  const next = () => {
    if (!val) return;
    patchQuiz({ occasions: val });
    nav("/quiz/step5-durability");
  };

  return (
    <div className="container-page section">
      <span className="eyebrow">STEP 4/5</span>
      <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-ink mb-2">สถานการณ์ที่ใช้</h1>
      <p className="text-taupe mb-6">เลือกได้ 1 ข้อ</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {OPTIONS.map((o) => (
          <label
            key={o.code}
            className={`card p-5 cursor-pointer transition flex items-center gap-4 ${val === o.code ? "card-selected" : "hover:shadow-md"}`}
          >
            <input
              type="radio"
              name="occasions"
              className="h-5 w-5 accent-berry"
              checked={val === o.code}
              onChange={() => setVal(o.code)}
            />
            <span className="text-lg text-ink">{o.label}</span>
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
