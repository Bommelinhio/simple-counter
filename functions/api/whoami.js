export async function onRequest({ request }) {
  const ip = request.headers.get("cf-connecting-ip") || "";
  const country = request.headers.get("cf-ipcountry") || "";
  return new Response(JSON.stringify({ ip, country }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}