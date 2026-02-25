function hasAdminCookie(request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.split(";").some((c) => c.trim() === "admin=1");
}

export async function onRequest(context) {
  const { request, env } = context;

  const key = "counter";
  const isAdmin = hasAdminCookie(request);

  const currentRaw = await env.COUNTER.get(key);
  const current = parseInt(currentRaw || "0", 10);

  // Admin: NICHT hochzählen, nur anzeigen
  if (isAdmin) {
    return new Response(JSON.stringify({ count: current, admin: true }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  // Normal: hochzählen
  const next = current + 1;
  await env.COUNTER.put(key, String(next));

  return new Response(JSON.stringify({ count: next, admin: false }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}