import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface StatCardProps { title: string; value: number | string; hint?: string }

function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <div className="admin-panel p-4">
      <div className="text-sm text-taupe">{title}</div>
      <div className="font-display text-2xl font-semibold mt-1 text-berry">{value}</div>
      {hint ? <div className="text-xs text-taupe mt-1">{hint}</div> : null}
    </div>
  );
}

interface Stats { lipTypes: number | string; brands: number | string; products: number | string; shades: number | string }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ lipTypes: "—", brands: "—", products: "—", shades: "—" });

  useEffect(() => {
    (async () => {
      const [lt, b, p, s] = await Promise.all([
        supabase.from("lip_types").select("code", { count: "exact", head: true }),
        supabase.from("brands").select("id",   { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("shades").select("id",   { count: "exact", head: true }),
      ]);

      setStats({
        lipTypes: lt.count ?? "—",
        brands:   b.count  ?? "—",
        products: p.count  ?? "—",
        shades:   s.count  ?? "—",
      });
    })();
  }, []);

  return (
    <div className="p-5 md:p-6">
      <div className="font-display text-xl font-semibold text-ink">Dashboard</div>
      <div className="text-sm text-taupe mt-1">
        ภาพรวมข้อมูลหลักของระบบ ใช้สำหรับติดตามจำนวนประเภทลิป แบรนด์ รุ่นสินค้า และเฉดสี
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Lip Types" value={stats.lipTypes} />
        <StatCard title="Brands"    value={stats.brands} />
        <StatCard title="Products"  value={stats.products} />
        <StatCard title="Shades"    value={stats.shades} />
      </div>
    </div>
  );
}
