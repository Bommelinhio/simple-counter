export async function onRequest(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  // Secret prüfen (kommt gleich aus Cloudflare Settings)
  if (!env.RESET_KEY || key !== env.RESET_KEY) {
    return new Response("Forbidden", { status: 403 });
  }

  // Zähler zurücksetzen
  await env.COUNTER.put("counter", "0");

  return new Response(JSON.stringify({ ok: true, count: 0 }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
