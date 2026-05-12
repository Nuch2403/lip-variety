import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "@/components/Navbar"; // แก้ path เป็น @
import Footer from "@/components/Footer"; // แก้ path เป็น @

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">กำลังโหลด…</div>}>
        <ScrollRestoration />
        {/* Outlet คือจุดที่หน้าเพจลูกๆ จะถูกนำมาแสดง */}
        <main className="flex-1">
          <Outlet />
        </main>
      </Suspense>
      <Footer />
    </div>
  );
}