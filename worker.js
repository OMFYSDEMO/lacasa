const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function token() {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return Array.from(a, b => b.toString(16).padStart(2, "0")).join("");
}

async function auth(env, req) {
  const h = req.headers.get("Authorization");
  if (!h || !h.startsWith("Bearer ")) return false;
  const t = h.slice(7);
  const s = await env.DB.prepare(
    "SELECT * FROM sessions WHERE token=? AND expires_at>datetime('now')"
  ).bind(t).first();
  return !!s;
}

async function initDB(env) {
  await env.DB.exec(
    "CREATE TABLE IF NOT EXISTS enquiries (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "name TEXT NOT NULL,email TEXT,phone TEXT," +
    "check_in TEXT,check_out TEXT,guests TEXT," +
    "room_type TEXT,message TEXT," +
    "status TEXT DEFAULT 'new'," +
    "created_at TEXT DEFAULT (datetime('now')))"
  );
  await env.DB.exec(
    "CREATE TABLE IF NOT EXISTS sessions (" +
    "token TEXT PRIMARY KEY," +
    "created_at TEXT DEFAULT (datetime('now'))," +
    "expires_at TEXT NOT NULL)"
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    try { await initDB(env); } catch (e) {}

    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // POST /api/enquiry
    if (url.pathname === "/api/enquiry" && request.method === "POST") {
      try {
        const b = await request.json();
        if (!b.name || !b.name.trim()) {
          return json({ error: "Name is required" }, 400);
        }
        await env.DB.prepare(
          "INSERT INTO enquiries " +
          "(name,email,phone,check_in,check_out," +
          "guests,room_type,message) " +
          "VALUES (?,?,?,?,?,?,?,?)"
        ).bind(
          b.name.trim(),
          b.email?.trim() || null,
          b.phone?.trim() || null,
          b.check_in?.trim() || null,
          b.check_out?.trim() || null,
          b.guests?.trim() || null,
          b.room_type?.trim() || null,
          b.message?.trim() || null
        ).run();
        return json({ success: true });
      } catch (e) {
        return json({ error: "Failed" }, 500);
      }
    }

    // POST /api/admin/login
    if (url.pathname === "/api/admin/login" && request.method === "POST") {
      try {
        const b = await request.json();
        if (b.password !== env.ADMIN_PASSWORD) {
          return json({ error: "Invalid password" }, 401);
        }
        const t = token();
        const exp = new Date(
          Date.now() + 86400000
        ).toISOString();
        await env.DB.prepare(
          "INSERT INTO sessions (token,expires_at) VALUES (?,?)"
        ).bind(t, exp).run();
        return json({ success: true, token: t });
      } catch (e) {
        return json({ error: "Login failed" }, 500);
      }
    }

    // All remaining routes need auth
    if (!await auth(env, request)) {
      return json({ error: "Unauthorized" }, 401);
    }

    // GET /api/enquiries
    if (url.pathname === "/api/enquiries" && request.method === "GET") {
      const r = await env.DB.prepare(
        "SELECT * FROM enquiries ORDER BY created_at DESC"
      ).all();
      return json({ enquiries: r.results });
    }

    const m = url.pathname.match(/^\/api\/enquiries\/(\d+)$/);

    // GET /api/enquiries/:id
    if (m && request.method === "GET") {
      const e = await env.DB.prepare(
        "SELECT * FROM enquiries WHERE id=?"
      ).bind(m[1]).first();
      if (!e) return json({ error: "Not found" }, 404);
      return json({ enquiry: e });
    }

    // PATCH /api/enquiries/:id
    if (m && request.method === "PATCH") {
      try {
        const b = await request.json();
        const valid = ["new","read","replied","archived"];
        if (!valid.includes(b.status)) {
          return json({ error: "Invalid status" }, 400);
        }
        await env.DB.prepare(
          "UPDATE enquiries SET status=? WHERE id=?"
        ).bind(b.status, m[1]).run();
        return json({ success: true });
      } catch (e) {
        return json({ error: "Update failed" }, 500);
      }
    }

    // DELETE /api/enquiries/:id
    if (m && request.method === "DELETE") {
      await env.DB.prepare(
        "DELETE FROM enquiries WHERE id=?"
      ).bind(m[1]).run();
      return json({ success: true });
    }

    return json({ error: "Not found" }, 404);
  },
};
