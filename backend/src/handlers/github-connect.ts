import { jsonResponse } from "../lib/http.js";
import { createGithubLink } from "../lib/composio.js";

export async function handler(event: { body?: string }) {
  try {
    const body = JSON.parse(event.body ?? "{}") as { user_id?: string };
    if (!body.user_id || body.user_id.length < 8) {
      return jsonResponse(400, { error: "user_id is required" });
    }
    const link = await createGithubLink(body.user_id);
    return jsonResponse(200, {
      redirect_url: link.redirect_url,
      connected_account_id: link.connected_account_id,
    });
  } catch (error) {
    console.error("GitHub connection setup failed", error);
    return jsonResponse(502, { error: "Could not create the GitHub connection link" });
  }
}
