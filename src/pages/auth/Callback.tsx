import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Callback() {
  const [msg, setMsg] = useState("กำลังตรวจสอบ…");

  useEffect(() => {
    (async () => {
      try {
        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } catch {
          // not OAuth — skip
        }

        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          setMsg("ไม่พบเซสชัน กรุณาลองล็อกอินใหม่อีกครั้ง");
          return;
        }

        const sp = new URLSearchParams(window.location.search);
        const next = sp.get("next");

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
      <div className="card px-6 py-8">
        <div className="text-ink/80">{msg}</div>
      </div>
    </div>
  );
}
