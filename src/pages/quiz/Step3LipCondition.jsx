import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadQuiz, patchQuiz, track } from "@/features/quiz/model/quizStorage.js";

import dryLipImg from "@/assets/ริมฝีปากแห้ง.jpg";
import moistLipImg from "@/assets/ริมฝีปากชุ่มชื้น.webp";

const OPTIONS = [
  {
    code: "dry",
    label: "ริมฝีปากแห้ง/แตกเป็นขุย",
    image: dryLipImg,
    desc: "ริมฝีปากมีความแห้ง ลอก หรือแตกง่าย ลิปเนื้อแมตต์อาจทำให้เห็นร่องริมฝีปากชัด"
  },
  {
    code: "normal",
    label: "ริมฝีปากปกติ–ชุ่มชื้น",
    image: moistLipImg,
    desc: "ริมฝีปากเรียบเนียน มีความชุ่มชื้น สามารถใช้ลิปได้หลายเนื้อสัมผัส"
  }
];

export default function Step3LipCondition(){
  const nav = useNavigate();
  const [val,setVal] = useState("");

  useEffect(()=>{
    track("step_change",{step:3});
    const q=loadQuiz();
    if(q.lipCondition?.code) setVal(q.lipCondition.code);
  },[]);

  const next=()=>{
    const picked = OPTIONS.find(o=>o.code===val);
    patchQuiz({ lipCondition: picked });
    nav("/quiz/step4-occasions");
  };

  return (
    <div className="container-page section">
      <h1 className="text-2xl font-bold mb-6">STEP 3/5 — สภาพริมฝีปาก</h1>

      <div className="grid sm:grid-cols-2 gap-4">
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
                name="lip"
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

      <div className="mt-8 flex items-center justify-between">
        <button className="btn-ghost" onClick={()=>nav(-1)}>
          ย้อนกลับ
        </button>

        <button
          className="btn-primary"
          disabled={!val}
          onClick={next}
        >
          ไปขั้นถัดไป
        </button>
      </div>
    </div>
  );
}