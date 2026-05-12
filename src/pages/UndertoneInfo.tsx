import { Link } from "react-router-dom";

import warmImg from "@/assets/Warm_undertone.jpg";
import coolImg from "@/assets/Cool_undertone.jpg";
import neutralImg from "@/assets/Neutral_undertone.jpg";

const CARDS = [
  {
    code: "warm",
    title: "Warm (โทนเหลือง/ทอง)",
    img: warmImg,
    bullets: ["เส้นเลือดที่ข้อมือออกเขียว", "เครื่องประดับทองมักขึ้น", "ออกแดดแล้วผิวเป็นสีแทนง่าย"],
  },
  {
    code: "cool",
    title: "Cool (โทนเย็น/น้ำเงิน)",
    img: coolImg,
    bullets: ["เส้นเลือดออกฟ้า/ม่วง", "เครื่องประดับเงิน/แพลตตินัมมักขึ้น", "ออกแดดแล้วอมชมพู/แดง"],
  },
  {
    code: "neutral",
    title: "Neutral (กึ่งกลาง)",
    img: neutralImg,
    bullets: ["มองเส้นเลือดออกทั้งเขียวและฟ้า", "ทอง/เงินใส่ได้พอ ๆ กัน", "ยืดหยุ่นต่อเฉดได้หลากหลาย"],
  },
];

export default function UndertoneInfo() {
  return (
    <div className="container-page section">
      <h1 className="text-2xl font-bold">Undertone คืออะไร</h1>

      <p className="mt-2 text-zinc-700">
        Undertone คือ "อุณหภูมิสี" ใต้ผิว (Warm/Cool/Neutral) ต่างจาก Skintone
        ที่เป็นระดับความสว่าง–ความเข้ม การรู้ Undertone ช่วยให้เลือกเฉดที่กลมกลืน
        หรือสร้างคอนทราสต์ได้อย่างตั้งใจ
      </p>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {CARDS.map((card) => (
          <div key={card.code} className="card p-5 rounded-2xl shadow hover:shadow-lg transition">
            <img src={card.img} alt={card.code} className="w-full h-40 object-contain mb-3" />
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <ul className="mt-2 list-disc pl-5 text-zinc-700">
              {card.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
            <p className="mt-3 text-sm text-zinc-500">
              * วิธีเช็คอย่างง่าย — ดูเส้นเลือดภายใต้แสงธรรมชาติ และลองวางกระดาษขาวเทียบผิว
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/quiz/step2-undertone" className="btn-primary">ไปเลือก Undertone</Link>
        <Link to="/quiz/step2-undertone" className="btn-ghost">ไม่แน่ใจ? เลือก Neutral ได้</Link>
      </div>
    </div>
  );
}
