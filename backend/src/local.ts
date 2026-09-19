// Local dev server (Bun) — mirrors API GW routes without deploying. `bun run dev:backend`
// CORS: API GW in prod has Cors '*' (template.yaml); mirror it here so the browser
// preflight (OPTIONS) succeeds and the web app on :3000 can call us.
import { handler as list } from "./handlers/list.js";
import { handler as recommend } from "./handlers/recommend.js";
import { handler as refresh } from "./handlers/refresh.js";

const port = Number(process.env.PORT ?? 3011);

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type",
};

function json(body: string, status = 200) {
  return new Response(body, { status, headers: { "content-type": "application/json", ...CORS_HEADERS } });
}

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    // Browser preflight — answer immediately, never 404.
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === "/hackathons" && req.method === "GET") {
      const params: Record<string, string> = {};
      url.searchParams.forEach((v, k) => (params[k] = v));
      const r = await list({ queryStringParameters: params });
      return json(r.body, r.statusCode);
    }
    if (url.pathname === "/recommend" && req.method === "POST") {
      const r = await recommend({ body: await req.text() });
      return json(r.body, r.statusCode);
    }
    if (url.pathname === "/hackathons/refresh" && req.method === "POST") {
      const r = await refresh();
      return json(r.body, r.statusCode);
    }
    if (url.pathname === "/healthz") {
      return json(JSON.stringify({ ok: true }));
    }
    return new Response("HackMaxx backend (bun). GET /hackathons | POST /recommend | POST /hackathons/refresh", {
      status: 404,
      headers: CORS_HEADERS,
    });
  },
});
console.log(`backend on http://localhost:${port}`);
