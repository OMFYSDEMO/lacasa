const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifySession(env, request) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  const session = await env.DB.prepare(
    "SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')"
  ).bind(token).first();
  return !!session;
}

async function initDB(env) {
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS enquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT, phone TEXT, check_in TEXT, check_out TEXT, guests TEXT, room_type TEXT, message TEXT, status TEXT DEFAULT 'new', created_at TEXT DEFAULT (datetime('now'))); CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, created_at TEXT DEFAULT (datetime('now')), expires_at TEXT NOT NULL);`);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    try { await initDB(env); } catch (e) {}

    if (url.pathname.startsWith("/api/")) {
      if (url.pathname === "/api/enqu
