import { Link } from "react-router-dom";

import warmImg from "@/assets/Warm_undertone.jpg";
import coolImg from "@/assets/Cool_undertone.jpg";
import neutralImg from "@/assets/Neutral_undertone.jpg";

const CARDS = [
  {
    code: "warm",
    title: "Warm (โทนเหลือง/ทอง)",
    img: warmImg,
    bullets: ["เส้นเลือดที่ข้อมือออกเขียว", "เหมาะกับเครื่องประดับทอง", "ออกแดดแล้วผิวเป็นสีแทนง่าย"],
  },
  {
    code: "cool",
    title: "Cool (โทนเย็น/น้ำเงิน)",
    img: coolImg,
    bullets: ["เส้นเลือดออกฟ้า/ม่วง", "เหมาะกับเครื่องประดับเงิน/แพลตตินัม", "ออกแดดแล้วอมชมพู/แดง"],
  },
  {
    code: "neutral",
    title: "Neutral (กึ่งกลาง)",
    img: neutralImg,
    bullets: ["มองเส้นเลือดออกทั้งเขียวและฟ้า", "เหมาะทั้งเครื่องประดับทอง และเงิน", "ออกแดดแล้วผิวเข้มขึ้นสม่ำเสมอ ไม่ออกแทนหรือชมพูจัด"],
  },
];

export default function UndertoneInfo() {
  return (
    <div className="container-page section">
      <span className="eyebrow">คู่มืออุณหภูมิสี</span>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-ink">Undertone คืออะไร</h1>

      <div className="mt-4 space-y-3 text-ink/70 leading-relaxed">
        <p className="lg:whitespace-nowrap">
          Undertone คือ "อุณหภูมิสี" ใต้ผิว (Warm/Cool/Neutral) ซึ่งต่างจาก Skintone ที่เป็นระดับความสว่าง–ความเข้มของผิว
        </p>
        <p>
          การรู้ Undertone ของตัวเองช่วยให้เลือกเฉดที่กลมกลืนกับผิว หรือสร้างคอนทราสต์ได้อย่างตั้งใจ
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {CARDS.map((card) => (
          <div key={card.code} className="card p-5 hover:shadow-md transition">
            <img src={card.img} alt={`ตัวอย่างผิวโทน ${card.title}`} className="w-full h-40 object-contain mb-3" />
            <h3 className="text-lg font-semibold text-berry">{card.title}</h3>
            <ul className="mt-2 list-disc pl-5 text-ink/70 space-y-0.5">
              {card.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-taupe">
        * วิธีเช็คอย่างง่าย — ดูเส้นเลือดภายใต้แสงธรรมชาติ และลองวางกระดาษขาวเทียบผิว
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-6">
        <Link to="/quiz/step2-undertone" className="btn-primary">ไปเลือก Undertone</Link>
        <Link to="/quiz/step2-undertone" className="btn-ghost">ไม่แน่ใจ? เลือก Neutral ได้</Link>
      </div>
    </div>
  );
}
