export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const password = String(body?.password || "");

  if (!env.RESET_KEY || password !== env.RESET_KEY) {
    return new Response("Forbidden", { status: 403 });
  }

  // 30 Tage Admin-Cookie
  const cookie =
    "admin=1; Max-Age=2592000; Path=/; Secure; SameSite=Lax";

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "set-cookie": cookie,
    },
  });
}