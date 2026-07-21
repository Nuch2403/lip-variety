import { Link } from "react-router-dom";
import logoUrl from "../assets/LipVarietyLogo.png";
import uniLogo from "../assets/PSUPhuketLogo.png";
import cocLogo from "../assets/College-of-Computing.png";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-white">
      <div className="h-[3px] bg-gradient-to-r from-berry via-gold to-berry" aria-hidden="true" />
      <div className="container-page py-10">
        <div className="grid gap-8 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="ไปหน้าแรก LipVariety">
              <img src={logoUrl} alt="" className="h-8 w-auto object-contain" />
              <span className="font-display text-lg font-semibold tracking-tight text-ink">LipVariety</span>
            </Link>
            <p className="mt-3 text-sm text-ink/70 max-w-md leading-relaxed">
              ตัวช่วยเลือกเฉดลิปแบบเป็นส่วนตัว—ทำควิซ 4–5 ขั้น แล้วรับคำแนะนำ
              <b className="text-ink"> Top 3 เฉด/รุ่น</b> ที่เข้ากับสีผิว โทนผิว และโอกาสการใช้งานของคุณ
            </p>
          </div>

          <div className="md:col-span-4">
            <div className="text-sm font-semibold text-ink">ลิงก์ด่วน</div>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              <li><Link className="hover:text-berry transition" to="/skintone">Skintone คืออะไร</Link></li>
              <li><Link className="hover:text-berry transition" to="/undertone">Undertone คืออะไร</Link></li>
              <li><Link className="hover:text-berry transition" to="/type-of-lipstick">ชนิด/ฟินิชของลิป</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-sm font-semibold text-ink">เกี่ยวกับสถาบันการศึกษา</div>
            <div className="mt-3 flex items-center gap-4">
              <img src={uniLogo} alt="มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตภูเก็ต" className="h-8 w-auto object-contain" />
              <img src={cocLogo} alt="College of Computing" className="h-8 w-auto object-contain" />
            </div>
            <p className="mt-3 text-sm text-ink/70 leading-relaxed">
              ผลงานเพื่อการศึกษาโดยนักศึกษาจาก วิทยาลัยการคอมพิวเตอร์
              มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตภูเก็ต
            </p>
            <ul className="mt-3 space-y-1 text-xs text-taupe">
              <li>ใช้เพื่อการเรียนรู้และพัฒนาทักษะเท่านั้น</li>
              <li>ไม่เกี่ยวข้องกับแบรนด์เครื่องสำอางใด ๆ อย่างเป็นทางการ</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-berry/10 pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-taupe">
          <div>© {year} LipVariety — สงวนสิทธิ์</div>
          <div className="flex items-center gap-4">
            <a href="#root" className="hover:text-berry transition">กลับขึ้นด้านบน</a>
            <Link to="/" className="hover:text-berry transition">หน้าแรก</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
