import { Link } from "react-router-dom";
import logoUrl from "../assets/LipVarietyLogo.png";
import uniLogo from "../assets/PSUPhuketLogo.png";
import cocLogo from "../assets/College-of-Computing.png";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-white">
      <div className="h-0.5 bg-brand/80" aria-hidden="true" />
      <div className="container-page py-10">
        <div className="grid gap-8 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="ไปหน้าแรก LipVariety">
              <img src={logoUrl} alt="" className="h-8 w-auto object-contain" />
              <span className="text-lg font-extrabold tracking-tight">LipVariety</span>
            </Link>
            <p className="mt-3 text-sm text-zinc-600 max-w-md">
              ตัวช่วยเลือกเฉดลิปแบบเป็นส่วนตัว—ทำควิซ 4–5 ขั้น แล้วรับคำแนะนำ
              <b> Top 3 เฉด/รุ่น</b> ที่เข้ากับสีผิว โทนผิว และโอกาสการใช้งานของคุณ
            </p>
          </div>

          <div className="md:col-span-4">
            <div className="text-sm font-semibold text-zinc-900">ลิงก์ด่วน</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:underline" to="/skintone">Skintone คืออะไร</Link></li>
              <li><Link className="hover:underline" to="/undertone">Undertone คืออะไร</Link></li>
              <li><Link className="hover:underline" to="/type-of-lipstick">ชนิด/ฟินิชของลิป</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-sm font-semibold text-zinc-900">เกี่ยวกับสถาบันการศึกษา</div>
            <div className="mt-3 flex items-center gap-4">
              <img src={uniLogo} alt="มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตภูเก็ต" className="h-8 w-auto object-contain" />
              <img src={cocLogo} alt="College of Computing" className="h-8 w-auto object-contain" />
            </div>
            <p className="mt-3 text-sm text-zinc-600">
              ผลงานเพื่อการศึกษาโดยนักศึกษาจาก วิทยาลัยการคอมพิวเตอร์
              มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตภูเก็ต
            </p>
            <ul className="mt-3 space-y-1 text-xs text-zinc-500">
              <li>ใช้เพื่อการเรียนรู้และพัฒนาทักษะเท่านั้น</li>
              <li>ไม่เกี่ยวข้องกับแบรนด์เครื่องสำอางใด ๆ อย่างเป็นทางการ</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-zinc-600">
          <div>© {year} LipVariety — สงวนสิทธิ์</div>
          <div className="flex items-center gap-4">
            <a href="#root" className="hover:underline">กลับขึ้นด้านบน</a>
            <Link to="/" className="hover:underline">หน้าแรก</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
