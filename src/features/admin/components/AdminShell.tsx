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
    <div className="admin-shell">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
          <aside className="admin-panel h-fit">
            <div className="p-4 border-b border-berry/10">
              <div className="font-display text-lg font-semibold text-berry">LipVariety Admin</div>
            </div>

            <nav className="p-2 space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    ["admin-nav-item", isActive ? "admin-nav-item-active" : "admin-nav-item-idle"].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="p-3 border-t border-berry/10 flex items-center justify-between">
              <a
                className="text-xs text-berry hover:underline"
                href="/"
                target="_blank"
                rel="noreferrer"
              >
                เปิดหน้าเว็บ →
              </a>
              <button
                className="admin-pill border-taupe/30 hover:bg-blush"
                onClick={logout}
              >
                ออกจากระบบ
              </button>
            </div>
          </aside>

          <main className="admin-panel">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
