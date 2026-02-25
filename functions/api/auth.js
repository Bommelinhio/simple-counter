function getClientIp(request) {
  return request.headers.get("cf-connecting-ip") || "";
}

function ipAllowed(env, ip) {
  const raw = (env.ADMIN_IPS || "").trim();
  if (!raw) return true; // wenn leer, dann keine IP-Restriktion
  const allowed = raw.split(",").map(s => s.trim()).filter(Boolean);
  return allowed.includes(ip);
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  // base64url
  let b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return b64;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const ip = getClientIp(request);
  if (!ipAllowed(env, ip)) {
    return new Response("Forbidden", { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const password = String(body?.password || "");
  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return new Response("Forbidden", { status: 403 });
  }

  const token = randomToken();

  // Token 30 Tage gültig
  await env.COUNTER.put(`token:${token}`, "1", { expirationTtl: 60 * 60 * 24 * 30 });

  const cookie = [
    `admin_token=${token}`,
    "Max-Age=2592000",
    "Path=/",
    "Secure",
    "SameSite=Lax",
  ].join("; ");

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "set-cookie": cookie,
    },
  });
}