import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center">กำลังโหลด…</div>}>
        <ScrollRestoration />
        <main className="flex-1">
          <Outlet />
        </main>
      </Suspense>
      <Footer />
    </div>
  );
}
