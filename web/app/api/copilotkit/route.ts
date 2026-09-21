import { type NextRequest } from "next/server";
import {
  CopilotRuntime,
  AnthropicAdapter,
  OpenAIAdapter,
  EmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { Anthropic } from "@anthropic-ai/sdk";

function getServiceAdapter() {
  if (process.env.ANTHROPIC_API_KEY) {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
    });
    return new AnthropicAdapter({
      anthropic: client,
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    });
  }

  if (process.env.OPENAI_API_KEY) {
    return new OpenAIAdapter({
      model: process.env.OPENAI_MODEL || "gpt-4o",
    });
  }

  // Fallback adapter for offline / keyless testing
  return new EmptyAdapter();
}

export const POST = async (req: NextRequest): Promise<Response> => {
  const runtime = new CopilotRuntime();
  const serviceAdapter = getServiceAdapter();
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
