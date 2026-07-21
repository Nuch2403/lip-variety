import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type LoginMode = "password" | "magic";

export default function AdminLogin() {
  const nav = useNavigate();
  const [mode, setMode]         = useState<LoginMode>("password");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg]           = useState("");
  const [busy, setBusy]         = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) return;

      const { data: ok, error } = await supabase.rpc("is_admin");
      if (!alive) return;
      if (ok) {
        nav("/admin", { replace: true });
      } else if (error) {
        console.warn("[AdminLogin] admin check error:", error);
      } else {
        setMsg("บัญชีนี้ล็อกอินอยู่ แต่ไม่ใช่ admin");
      }
    })();
    return () => { alive = false; };
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setBusy(true);

    try {
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); return; }
        const { data: ok } = await supabase.rpc("is_admin");
        if (!ok) { setMsg("บัญชีนี้ไม่มีสิทธิ์ admin"); await supabase.auth.signOut(); return; }
        nav("/admin", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setMsg("ส่งลิงก์เข้าใช้งานไปที่อีเมลแล้ว");
      }
    } catch (err) {
      console.error(err);
      setMsg((err as Error).message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-shell grid place-items-center p-6">
      <div className="w-full max-w-md admin-panel p-6">
        <div className="font-display text-xl font-semibold text-berry">Admin Login</div>

        <div className="mt-4 flex gap-2">
          {(["password", "magic"] as LoginMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={["flex-1 rounded-lg border px-3 py-2 text-sm transition", mode === m ? "bg-berry text-cream border-berry" : "border-taupe/30 hover:bg-blush text-ink"].join(" ")}
              onClick={() => setMode(m)}
            >
              {m === "password" ? "Password" : "Magic Link"}
            </button>
          ))}
        </div>

        <form className="mt-4 space-y-3" onSubmit={submit}>
          <div>
            <label className="admin-label">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>

          {mode === "password" && (
            <div>
              <label className="admin-label">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button disabled={busy} className="w-full admin-btn-primary py-2 disabled:opacity-50">
            {busy ? "Working…" : "Login"}
          </button>

          {msg ? <div className="rounded-lg border border-taupe/20 bg-blush/60 p-3 text-sm text-ink">{msg}</div> : null}
        </form>
      </div>
    </div>
  );
}
