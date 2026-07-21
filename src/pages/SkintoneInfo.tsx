import { Link } from "react-router-dom";

import imgPale from "@/assets/PaleSkin.png";
import imgFair from "@/assets/FairSkin.png";
import imgOlive from "@/assets/OliveSkinpng.png";
import imgTan from "@/assets/TanSkin.png";
import imgDark from "@/assets/DarkSkin.png";

const SKINTONE = [
  { code: "fair",         label: "ผิวขาวซีด",    img: imgPale,  desc: "ผิวหนังมีสีซีดหรือใส ไหม้แดดได้ง่ายมาก และผิวมักมีรอยตกกระหรือรอยแดงให้เห็นชัด" },
  { code: "light_yellow", label: "ผิวขาวเหลือง", img: imgFair,  desc: "ผิวโทนเหลือง พบบ่อยในคนเอเชีย โดนแดดแล้วไหม้ก่อนเป็นสีแทน" },
  { code: "medium",       label: "ผิวสองสี",      img: imgOlive, desc: "ผิวโทนกลางระหว่างสว่างและแทน ไหม้แดดยาก และปรับเข้มขึ้นได้เมื่อโดนแดดต่อเนื่อง" },
  { code: "tan",          label: "ผิวแทน",        img: imgTan,   desc: "ผิวโทนแทนหรือสีน้ำผึ้ง ไหม้แดดยาก และยังคงดูมีสีแทนอยู่แม้ในหน้าหนาว" },
  { code: "deep",         label: "ผิวเข้ม",       img: imgDark,  desc: "ผิวสีเข้มมีเมลานินมาก ไหม้แดดยากกว่าโทนอื่น แต่ยังควรป้องกันแดด" },
];

export default function SkintoneInfo() {
  return (
    <div className="container-page section">
      <span className="eyebrow">คู่มือสกินโทน</span>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
        สกินโทน (Skintone) คืออะไร?
      </h1>

      <p className="mt-4 text-ink/70 leading-relaxed">
        สกินโทน (Skin Tone) คือสีผิวภายนอกที่มองเห็นได้ แบ่งเป็น 5 ประเภทหลักตามด้านล่างนี้
        เปลี่ยนแปลงได้ตามปัจจัยรอบตัว เช่น แสงแดดหรือการบำรุงผิว
        ตรวจสอบง่าย ๆ ได้จากสีผิวบริเวณแขน คอ หรือใบหน้าใต้แสงธรรมชาติ โดยเฉพาะบริเวณสันกราม
      </p>

      <div className="mt-8 grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3">
        {SKINTONE.map((s) => (
          <article key={s.code} className="card p-5 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <img
                src={s.img}
                alt={s.label}
                className="h-16 w-24 rounded-lg object-cover border border-berry/10"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h2 className="text-lg font-semibold text-berry">{s.label}</h2>
                <p className="mt-1 text-ink/70 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-6">
        <Link to="/quiz/step1-skintone" className="btn-primary">ไปเลือก Skintone</Link>
        <Link to="/undertone" className="btn-ghost">อ่านเรื่อง Undertone ต่อ</Link>
      </div>

      <p className="mt-6 text-xs text-taupe">
        * สีที่เห็นบนหน้าจออาจคลาดเคลื่อนจากของจริงเล็กน้อย ขึ้นกับหน้าจอและแสงขณะดู
      </p>
    </div>
  );
}
