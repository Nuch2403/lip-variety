import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * หน้ารับกลับหลังคลิกลิงก์ (magic link / oauth)
 * - ยืนยันว่ามี session แล้ว
 * - redirect ไป path ที่รับมาทาง ?next= (หรือ /)
 * - ป้องกัน redirect ไป /admin เพราะถอดระบบ Admin ออกแล้ว
 */
export default function Callback() {
  const [msg, setMsg] = useState("กำลังตรวจสอบ…");

  useEffect(() => {
    (async () => {
      try {
        // OAuth/PKCE: แลก code → session (ถ้ามี)
        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } catch {
          // ไม่ใช่ OAuth ก็ข้ามได้
        }

        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          setMsg("ไม่พบเซสชัน กรุณาลองล็อกอินใหม่อีกครั้ง");
          return;
        }

        const sp = new URLSearchParams(window.location.search);
        const next = sp.get("next");

        // sanitize: ต้องเป็น path ภายในเท่านั้น + ห้ามไป /admin
        let dest = "/";
        if (next && next.startsWith("/") && !next.startsWith("/admin")) dest = next;

        setMsg("สำเร็จ! กำลังพากลับ…");
        window.location.replace(dest);
      } catch (e) {
        console.error(e);
        setMsg("เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบ");
      }
    })();
  }, []);

  return (
    <div className="min-h-[50vh] grid place-items-center p-6">
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-8 shadow-sm">
        <div className="text-zinc-700">{msg}</div>
      </div>
    </div>
  );
}
