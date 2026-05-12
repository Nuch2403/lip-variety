import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const nav = useNavigate();
  const [mode, setMode] = useState("password"); // password | magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) return;

      // double-check admin via RPC before auto-redirect
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
    return () => {
      alive = false;
    };
  }, [nav]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);

    try {
      if (mode === "password") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          console.error(error);
          setMsg(error.message);
          return; // ❗ ห้ามไปต่อ
        }

        // login สำเร็จจริง ค่อย redirect
        nav("/admin", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });
        if (error) throw error;
        setMsg("ส่งลิงก์เข้าใช้งานไปที่อีเมลแล้ว");
      }
    } catch (err) {
      console.error(err);
      setMsg(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-sm p-6">
        <div className="text-xl font-semibold">Admin Login</div>
        <div className="text-sm text-zinc-600 mt-1">
          เข้าผ่าน URL ตรง: <span className="font-mono">/admin</span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            className={[
              "flex-1 rounded-xl border px-3 py-2 text-sm",
              mode === "password" ? "bg-zinc-900 text-white" : "hover:bg-zinc-50",
            ].join(" ")}
            onClick={() => setMode("password")}
            type="button"
          >
            Password
          </button>
          <button
            className={[
              "flex-1 rounded-xl border px-3 py-2 text-sm",
              mode === "magic" ? "bg-zinc-900 text-white" : "hover:bg-zinc-50",
            ].join(" ")}
            onClick={() => setMode("magic")}
            type="button"
          >
            Magic Link
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={submit}>
          <div>
            <label className="text-xs text-zinc-600">Email</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>

          {mode === "password" ? (
            <div>
              <label className="text-xs text-zinc-600">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          ) : null}

          <button
            disabled={busy}
            className="w-full rounded-xl bg-zinc-900 text-white py-2 hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Working…" : "Login"}
          </button>

          {msg ? (
            <div className="rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-700">{msg}</div>
          ) : null}

          <div className="text-xs text-zinc-500">
            สิทธิ์เขียน DB/อัปโหลดรูปถูกคุมโดย RLS + ตาราง <span className="font-mono">rpc is_admin()</span>
          </div>
        </form>
      </div>
    </div>
  );
}

