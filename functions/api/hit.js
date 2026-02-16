export async function onRequest(context) {
  const { env } = context;

  const key = "counter";
  const currentRaw = await env.COUNTER.get(key);
  const current = parseInt(currentRaw || "0", 10);

  const next = current + 1;
  await env.COUNTER.put(key, String(next));

  return new Response(JSON.stringify({ count: next }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
