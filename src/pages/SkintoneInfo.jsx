import { Link } from "react-router-dom";

// รูปจาก assets ของคุณ (สะกดชื่อไฟล์ให้ตรงตามที่มีจริง)
import imgPale from "@/assets/PaleSkin.png";
import imgFair from "@/assets/FairSkin.png";
import imgOlive from "@/assets/OliveSkinpng.png"; // ตามไฟล์ที่คุณมีในโฟลเดอร์
import imgTan from "@/assets/TanSkin.png";
import imgDark from "@/assets/DarkSkin.png";

const SKINTONE = [
  {
    code: "fair",
    label: "ผิวขาวซีด",
    img: imgPale,
    desc:
      "ผิวหนังมีสีซีดหรือใส คุณจะแพ้แดดได้ง่ายมาก ผิวมักจะมีรอยตกกระหรือมีรอยแดง"
  },
  {
    code: "light_yellow",
    label: "ผิวขาวเหลือง",
    img: imgFair,
    desc:
      "ผิวที่พบบ่อยในเอเชีย โทนออกเหลืองนิด ๆ เวลาที่ตากแดด ผิวจะไหม้และอาจเป็นสีแทน"
  },
  {
    code: "medium",
    label: "ผิวสองสี",
    img: imgOlive, // ใช้ภาพ Olive เป็นตัวแทนโทนกลาง/มะกอก
    desc:
      "ผิวมักจะไม่ค่อยไหม้แดดหรือแพ้อะไรง่ายนัก บาลานซ์ระหว่างสว่างและแทน"
  },
  {
    code: "tan",
    label: "ผิวแทน",
    img: imgTan,
    desc:
      "ผิวจะเป็นสีแทนหรือสีน้ำผึ้ง ผิวจะไหม้แดดยากและผิวยังดูออกสีแทนแม้ในหน้าหนาว"
  },
  {
    code: "deep",
    label: "ผิวเข้ม",
    img: imgDark,
    desc:
      "ผิวสีเข้มและจะไม่มีทางเกิดอาการผิวไหม้แดด"
  }
];

export default function SkintoneInfo() {
  return (
    <div className="container-page section">
      {/* Header */}
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-brand-100 text-brand">
        คู่มือสกินโทน
      </div>
      <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
        สกินโทน (Skintone) คืออะไร?
      </h1>

      {/* ยังคง “คำอธิบายเดิม” ตามที่คุณให้มา */}
      <p className="mt-3 text-zinc-700 leading-relaxed">
        สกินโทน (Skin Tone) คือ สีผิวที่มองเห็นได้จากภายนอก แบ่งได้ 5 ประเภท คือ 1. ผิวขาวซีด 2. ผิวขาวเหลือง 3. ผิวสองสี 4. ผิวแทน 5. ผิวน้ำตาลเข้ม ซึ่งสามารถเปลี่ยนแปลงตลอดเวลา ขึ้นอยู่กับปัจจัยที่มารบกวนผิว เช่น การโดนแดดหรือการบำรุงผิว การตรวจสอบ Skin Tone สามารถทำได้โดยการสังเกตสีผิวบริเวณแขน คอ หรือใบหน้าในที่แสงธรรมชาติ โดยเฉพาะการสังเกตผิวบริเวณสันกรามเพื่อวัดระดับผิวพรรณของคุณ
      </p>

      {/* Cards */}
      <div className="mt-6 grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3">
        {SKINTONE.map((s) => (
          <article key={s.code} className="card p-5 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <img
                src={s.img}
                alt={s.label}
                className="h-16 w-24 rounded-lg object-cover ring-1 ring-black/10"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h2 className="text-lg font-semibold text-brand">{s.label}</h2>
                <p className="mt-1 text-zinc-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/quiz/step1-skintone" className="btn-primary">
          ไปเลือก Skintone
        </Link>
        <Link to="/undertone" className="btn-ghost">
          อ่านเรื่อง Undertone ต่อ
        </Link>
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        * สีที่เห็นบนหน้าจออาจคลาดเคลื่อนจากของจริงเล็กน้อย ขึ้นกับหน้าจอและแสงขณะดู
      </p>
    </div>
  );
}
