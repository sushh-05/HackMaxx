import { jsonResponse } from "../lib/http.js";

export async function handler() {
  return jsonResponse(200, {
    ok: true,
    service: "hackmaxx-api",
    checkedAt: new Date().toISOString(),
  });
}
