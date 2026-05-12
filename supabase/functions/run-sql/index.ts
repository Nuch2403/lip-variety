// supabase/functions/run-sql/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DB_URL = Deno.env.get("SUPABASE_DB_URL") || Deno.env.get("DATABASE_URL");

if (!SUPABASE_URL || !SERVICE_KEY || !DB_URL) {
  console.error("Missing env SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DB_URL");
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check admin via public.admin_users
    const { data: adminRow, error: adminErr } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userRes.user.id)
      .maybeSingle();

    if (adminErr || !adminRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const sql = typeof body.sql === "string" ? body.sql.trim() : "";
    if (!sql) {
      return new Response(JSON.stringify({ error: "empty_sql" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Safety: allow only SELECT/EXPLAIN/with CTE read-only
    const lowered = sql.toLowerCase();
    if (!lowered.startsWith("select") && !lowered.startsWith("with") && !lowered.startsWith("explain")) {
      return new Response(JSON.stringify({ error: "only_select_allowed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sqlClient = postgres(DB_URL, { prepare: false });
    const rows = await sqlClient.unsafe(sql);

    return new Response(JSON.stringify({ result: rows }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[run-sql] error", e);
    return new Response(JSON.stringify({ error: e.message || "unknown" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
