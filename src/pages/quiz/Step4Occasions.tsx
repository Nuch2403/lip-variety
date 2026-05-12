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
      <h1 className="text-2xl font-bold mb-3">STEP 4/5 — สถานการณ์ที่ใช้</h1>
      <p className="text-zinc-600 mb-6">เลือกได้ 1 ข้อ</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OPTIONS.map((o) => (
          <label
            key={o.code}
            className={"relative block rounded-2xl border p-5 cursor-pointer transition " + (val === o.code ? "border-red-700 ring-1 ring-red-700/40 bg-red-50" : "border-zinc-200 hover:bg-zinc-50")}
          >
            <input
              type="radio"
              name="occasions"
              className="sr-only"
              checked={val === o.code}
              onChange={() => setVal(o.code)}
              aria-label={o.label}
            />
            <div className="flex items-center gap-4">
              <span className={"inline-block h-5 w-5 rounded-full border-2 " + (val === o.code ? "border-red-700 bg-red-700" : "border-zinc-300 bg-white")} />
              <span className="text-lg">{o.label}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button className="btn-ghost" onClick={() => nav(-1)}>ย้อนกลับ</button>
        <button className="btn-primary" disabled={!val} onClick={next}>ไปขั้นถัดไป</button>
      </div>
    </div>
  );
}
