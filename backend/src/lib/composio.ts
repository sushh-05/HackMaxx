const COMPOSIO_BASE_URL = "https://backend.composio.dev/api/v3.1";
const GITHUB_TOOL_VERSION = "20260916_00";

function getConfig() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  const authConfigId = process.env.COMPOSIO_GITHUB_AUTH_CONFIG_ID;
  if (!apiKey || !authConfigId) {
    throw new Error("Composio is not configured. Set COMPOSIO_API_KEY and COMPOSIO_GITHUB_AUTH_CONFIG_ID.");
  }
  return { apiKey, authConfigId };
}

async function composioFetch(path: string, init: RequestInit = {}) {
  const { apiKey } = getConfig();
  const response = await fetch(`${COMPOSIO_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Composio request failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return body as Record<string, unknown>;
}

export async function createGithubLink(userId: string) {
  const { authConfigId } = getConfig();
  const webAppUrl = process.env.WEB_APP_URL ?? "http://localhost:3000";
  return composioFetch("/connected_accounts/link", {
    method: "POST",
    body: JSON.stringify({
      auth_config_id: authConfigId,
      user_id: userId,
      callback_url: `${webAppUrl}/maxx?github=connected`,
    }),
  });
}

export async function listGithubRepositories(userId: string, connectedAccountId: string) {
  return composioFetch("/tools/execute/GITHUB_LIST_REPOSITORIES_FOR_THE_AUTHENTICATED_USER", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      connected_account_id: connectedAccountId,
      version: GITHUB_TOOL_VERSION,
      arguments: { per_page: 50, page: 1, sort: "updated" },
    }),
  });
}
