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

  const key = "counter";
  const admin = await isAdmin(request, env);

  const currentRaw = await env.COUNTER.get(key);
  const current = parseInt(currentRaw || "0", 10);

  if (admin) {
    return new Response(JSON.stringify({ count: current, admin: true }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const next = current + 1;
  await env.COUNTER.put(key, String(next));

  return new Response(JSON.stringify({ count: next, admin: false }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}