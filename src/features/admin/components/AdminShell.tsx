import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const navItems = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/lip-types", label: "Lip Types" },
  { to: "/admin/brands", label: "Brands" },
  { to: "/admin/finishes", label: "Finishes" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/shades", label: "Shades" },
];

export default function AdminShell() {
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border bg-white shadow-sm">
            <div className="p-4 border-b">
              <div className="text-lg font-semibold">LipVariety Admin</div>
            </div>

            <nav className="p-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    [
                      "block rounded-xl px-3 py-2 text-sm transition",
                      isActive ? "bg-zinc-900 text-white" : "hover:bg-zinc-100",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="p-3 border-t flex items-center justify-between">
              <a
                className="text-xs underline text-zinc-600"
                href="/"
                target="_blank"
                rel="noreferrer"
              >
                เปิดหน้าเว็บ →
              </a>
              <button
                className="text-xs rounded-full border px-3 py-1 hover:bg-zinc-50"
                onClick={logout}
              >
                ออกจากระบบ
              </button>
            </div>
          </aside>

          <main className="rounded-2xl border bg-white shadow-sm">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
