import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const LOG = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log("[AdminGuard]", ...args);
};

interface AdminGuardProps {
  children: React.ReactNode;
}

interface GuardState {
  loading: boolean;
  ok: boolean;
  reason: string;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const loc = useLocation();
  const nav = useNavigate();
  const [state, setState] = useState<GuardState>({ loading: true, ok: false, reason: "" });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, ok: false, reason: "" });

    (async () => {
      try {
        LOG("getSession start");
        const sessionRes = await supabase.auth.getSession();
        LOG("getSession done", sessionRes?.error);
        const user = sessionRes?.data?.session?.user;

        if (!user) {
          if (alive) setState({ loading: false, ok: false, reason: "no_session" });
          nav("/admin/login", { replace: true, state: { reason: "no_session" } });
          return;
        }

        LOG("is_admin rpc start");
        const { data, error } = await supabase.rpc("is_admin");
        LOG("is_admin rpc done", error);

        const ok = !!data && !error;
        const reason = error ? `rpc_error:${error.code ?? "unknown"}` : ok ? "" : "not_admin";

        if (!ok) {
          if (alive) setState({ loading: false, ok: false, reason });
          nav("/admin/login", { replace: true, state: { reason } });
          return;
        }

        if (alive) setState({ loading: false, ok: true, reason: "" });
      } catch (e) {
        console.error("[AdminGuard] unexpected:", e);
        if (alive) setState({ loading: false, ok: false, reason: "exception" });
      }
    })();

    return () => { alive = false; };
  }, [loc.pathname]);

  if (state.loading) return <div className="p-8 text-center">Checking admin…</div>;
  if (!state.ok) return <Navigate to="/admin/login" replace state={{ reason: state.reason }} />;
  return <>{children}</>;
}
