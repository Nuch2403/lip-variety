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
        setMsg("เธเธฑเธเธเธตเธเธตเนเธฅเนเธญเธเธญเธดเธเธญเธขเธนเน เนเธ•เนเนเธกเนเนเธเน admin");
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
        if (error) { setMsg("เธญเธตเน€เธกเธฅเธซเธฃเธทเธญเธฃเธซเธฑเธชเธเนเธฒเธเนเธกเนเธ–เธนเธเธ•เนเธญเธ"); return; }
        const { data: ok } = await supabase.rpc("is_admin");
        if (!ok) { setMsg("เธเธฑเธเธเธตเธเธตเนเนเธกเนเธกเธตเธชเธดเธ—เธเธดเน admin"); await supabase.auth.signOut(); return; }
        nav("/admin", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setMsg("เธชเนเธเธฅเธดเธเธเนเน€เธเนเธฒเนเธเนเธเธฒเธเนเธเธ—เธตเนเธญเธตเน€เธกเธฅเนเธฅเนเธง");
      }
    } catch (err) {
      console.error(err);
      setMsg((err as Error).message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-sm p-6">
        <div className="text-xl font-semibold">Admin Login</div>
        <div className="text-sm text-zinc-600 mt-1">
          เน€เธเนเธฒเธเนเธฒเธ URL เธ•เธฃเธ: <span className="font-mono">/admin</span>
        </div>

        <div className="mt-4 flex gap-2">
          {(["password", "magic"] as LoginMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={["flex-1 rounded-xl border px-3 py-2 text-sm", mode === m ? "bg-zinc-900 text-white" : "hover:bg-zinc-50"].join(" ")}
              onClick={() => setMode(m)}
            >
              {m === "password" ? "Password" : "Magic Link"}
            </button>
          ))}
        </div>

        <form className="mt-4 space-y-3" onSubmit={submit}>
          <div>
            <label className="text-xs text-zinc-600">Email</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              required
            />
          </div>

          {mode === "password" && (
            <div>
              <label className="text-xs text-zinc-600">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button disabled={busy} className="w-full rounded-xl bg-zinc-900 text-white py-2 hover:opacity-90 disabled:opacity-50">
            {busy ? "Workingโ€ฆ" : "Login"}
          </button>

          {msg ? <div className="rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-700">{msg}</div> : null}
        </form>
      </div>
    </div>
  );
}
