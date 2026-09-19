// Local dev server (Bun) — mirrors API GW routes without deploying. `bun --filter backend dev`
import { handler as list } from "./handlers/list.js";
import { handler as recommend } from "./handlers/recommend.js";
import { handler as refresh } from "./handlers/refresh.js";

const port = Number(process.env.PORT ?? 3001);
Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/hackathons" && req.method === "GET") {
      const params: Record<string, string> = {};
      url.searchParams.forEach((v, k) => (params[k] = v));
      const r = await list({ queryStringParameters: params });
      return Response.json(JSON.parse(r.body));
    }
    if (url.pathname === "/recommend" && req.method === "POST") {
      const r = await recommend({ body: await req.text() });
      return new Response(r.body, { status: r.statusCode, headers: { "content-type": "application/json" } });
    }
    if (url.pathname === "/hackathons/refresh" && req.method === "POST") {
      const r = await refresh();
      return new Response(r.body, { status: r.statusCode, headers: { "content-type": "application/json" } });
    }
    return new Response("HackMaxx backend (bun). GET /hackathons | POST /recommend | POST /hackathons/refresh", { status: 404 });
  },
});
console.log(`backend on http://localhost:${port}`);
