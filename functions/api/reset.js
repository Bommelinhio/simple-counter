function getClientIp(request) {
  return request.headers.get("cf-connecting-ip") || "";
}

function ipAllowed(env, ip) {
  const raw = (env.ADMIN_IPS || "").trim();
  if (!raw) return true;
  const allowed = raw.split(",").map(s => s.trim()).filter(Boolean);
  return allowed.includes(ip);
}

function getCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  const parts = cookie.split(";").map(s => s.trim());
  for (const p of parts) {
    if (p.startsWith(name + "=")) return p.slice(name.length + 1);
  }
  return "";
}

async function isAdmin(request, env) {
  const ip = getClientIp(request);
  if (!ipAllowed(env, ip)) return false;

  const token = getCookie(request, "admin_token");
  if (!token) return false;

  const ok = await env.COUNTER.get(`token:${token}`);
  return ok === "1";
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const admin = await isAdmin(request, env);
  if (!admin) return new Response("Forbidden", { status: 403 });

  await env.COUNTER.put("counter", "0");
  return new Response(JSON.stringify({ ok: true, count: 0 }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}