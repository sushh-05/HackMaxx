import { jsonResponse } from "../lib/http.js";
import { listGithubRepositories } from "../lib/composio.js";

export async function handler(event: { body?: string }) {
  try {
    const body = JSON.parse(event.body ?? "{}") as {
      user_id?: string;
      connected_account_id?: string;
    };
    if (!body.user_id || !body.connected_account_id) {
      return jsonResponse(400, { error: "user_id and connected_account_id are required" });
    }
    const result = await listGithubRepositories(body.user_id, body.connected_account_id);
    return jsonResponse(200, result);
  } catch (error) {
    console.error("GitHub repository listing failed", error);
    return jsonResponse(502, { error: "Could not load GitHub repositories" });
  }
}
