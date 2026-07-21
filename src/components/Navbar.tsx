import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logoUrl from "../assets/LipVarietyLogo.png";

interface NavItemProps {
  to: string;
  children: React.ReactNode;
  end?: boolean;
}

function NavItem({ to, children, end = false }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "relative px-1 py-2 text-sm font-medium transition",
          "after:absolute after:left-0 after:right-0 after:-bottom-[1px] after:h-[2px] after:rounded-full after:transition-transform",
          isActive
            ? "text-berry after:bg-berry after:scale-x-100"
            : "text-ink/70 hover:text-ink after:bg-gold after:scale-x-0 hover:after:scale-x-100",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hideCta = /^\/quiz(\/|$)/.test(pathname) || pathname === "/results";

  const m = pathname.match(/^\/quiz\/step(\d)/);
  const step = m ? Number(m[1]) : null;
  const stepLabel = step ? `STEP ${step}/5` : null;
  const progress = step ? Math.min(100, Math.max(0, (step / 5) * 100)) : 0;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-ink text-cream px-3 py-2 rounded"
      >
        ข้ามไปเนื้อหา
      </a>

      <header
        className={[
          "sticky top-0 z-50 border-b border-berry/10",
          "bg-cream/80 backdrop-blur supports-[backdrop-filter]:bg-cream/70",
          scrolled ? "shadow-sm" : "",
        ].join(" ")}
      >
        <div className="container-page">
          <div className="flex items-center gap-4 py-3">
            <Link to="/" aria-label="ไปหน้าแรก LipVariety" className="flex items-center">
              <img src={logoUrl} alt="LipVariety" className="h-10 sm:h-12 w-auto object-contain" />
            </Link>

            <nav className="hidden lg:flex items-center gap-7 ml-8">
              <NavItem to="/" end>Home</NavItem>
              <NavItem to="/skintone">Skintone</NavItem>
              <NavItem to="/undertone">Undertone</NavItem>
              <NavItem to="/type-of-lipstick">Types of Lipstick</NavItem>
            </nav>

            {!hideCta && (
              <div className="hidden lg:flex items-center gap-2 ml-auto">
                <Link to="/quiz/step1-skintone" className="btn-primary">
                  Start Quiz
                </Link>
              </div>
            )}

            <button
              className="ml-auto inline-flex items-center justify-center h-10 w-10 rounded-lg lg:hidden hover:bg-blush text-ink"
              aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((s) => !s)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {open ? (
                  <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
                )}
              </svg>
            </button>
          </div>

          {step && (
            <div className="pb-3">
              <div className="flex items-center justify-between text-xs text-taupe">
                <span className="font-medium tracking-wide">{stepLabel}</span>
                <span className="tabular-nums">{Math.round(progress)}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-blush">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-berry to-gold"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {open && (
          <div className="lg:hidden border-t border-berry/10" id="mobile-nav">
            <div className="container-page py-3">
              <nav className="flex flex-col gap-1">
                <NavItem to="/" end>Home</NavItem>
                <NavItem to="/skintone">Skintone</NavItem>
                <NavItem to="/undertone">Undertone</NavItem>
                <NavItem to="/type-of-lipstick">Types of Lipstick</NavItem>
                {!hideCta && (
                  <Link to="/quiz/step1-skintone" className="btn-primary mt-2 self-start">
                    Start Quiz
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      <span id="main" />
    </>
  );
}
