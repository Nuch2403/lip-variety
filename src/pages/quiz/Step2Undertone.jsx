import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loadQuiz, patchQuiz, track } from "@/features/quiz/model/quizStorage.js";

import warmImg from "@/assets/Warm_undertone.jpg";
import coolImg from "@/assets/Cool_undertone.jpg";
import neutralImg from "@/assets/Neutral_undertone.jpg";

const OPTIONS = [
  {
    code: "warm",
    label: "โทนผิวอุ่น (Warm)",
    image: warmImg,
    desc: "ผิวโทนเหลืองหรือทอง เส้นเลือดใต้ผิวมีสีเขียว เครื่องประดับสีทองมักเข้ากับผิว"
  },
  {
    code: "cool",
    label: "โทนเย็น (Cool)",
    image: coolImg,
    desc: "ผิวโทนชมพูหรือแดง เส้นเลือดใต้ผิวมีสีน้ำเงินหรือม่วง เครื่องประดับสีเงินมักเข้ากับผิว"
  },
  {
    code: "neutral",
    label: "โทนกลาง (Neutral)",
    image: neutralImg,
    desc: "ผิวผสมทั้งโทนอุ่นและเย็น เส้นเลือดใต้ผิวมีสีเขียวอมน้ำเงิน ใช้ได้ทั้งสีทองและสีเงิน"
  }
];

export default function Step2Undertone(){
  const nav = useNavigate();
  const [val,setVal] = useState("");

  useEffect(()=>{
    track("step_change",{step:2});
    const q=loadQuiz();
    if(q.undertone?.code) setVal(q.undertone.code);
  },[]);

  const next=()=>{
    const picked = (val || "neutral"); // ถ้า user กด “ไม่แน่ใจ” จะส่ง Neutral
    const meta = OPTIONS.find(o=>o.code===picked) || OPTIONS[2];
    patchQuiz({ undertone: meta });
    nav("/quiz/step3-lip");
  };

  return (
    <div className="container-page section">
      <h1 className="text-2xl font-bold mb-3">STEP 2/5 — Undertone อุณหภูมิใต้ผิว</h1>

      <p className="text-zinc-600 mb-6">ไม่แน่ใจ? กด <b>ไม่แน่ใจ</b> เพื่ออ่านวิธีดู Undertone เพิ่มเติม</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OPTIONS.map(o=>(
          <label
            key={o.code}
            className={`card p-5 cursor-pointer transition ${
              val===o.code ? "ring-2 ring-red-700" : "hover:shadow-lg"
            }`}
          >
            <div className="flex items-start gap-4">
              <img
                src={o.image}
                alt={o.label}
                className="h-20 w-20 rounded-md object-cover border border-zinc-200"
              />

              <input
                type="radio"
                name="undertone"
                className="h-5 w-5 accent-red-700 mt-1"
                checked={val===o.code}
                onChange={()=>setVal(o.code)}
              />

              <div>
                <span className="text-lg font-medium block">
                  {o.label}
                </span>

                <p className="text-sm text-zinc-500 mt-1 leading-snug">
                  {o.desc}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button className="btn-ghost" onClick={()=>nav(-1)}>
          ย้อนกลับ
        </button>

        <div className="flex items-center gap-2">
          <Link to="/undertone" className="btn-ghost">ไม่แน่ใจ</Link>

          <button
            className="btn-primary"
            disabled={!val}
            onClick={next}
          >
            ไปขั้นถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}