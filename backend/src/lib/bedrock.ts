// Bedrock access (AWS AI provider — ONLY LLM path in prod).
// Phase 0: stubs return null → callers fall back to keyword similarity so demo never dies.
export async function embedText(_text: string): Promise<number[] | null> {
  // TODO Phase 2: Bedrock Titan embeddings via @aws-sdk/client-bedrock-runtime.
  return null;
}

export async function explainMatch(args: {
  projectTitle: string;
  hackathonTitle: string;
  fallback: string;
}): Promise<string> {
  // TODO Phase 3: Bedrock Claude call for 1-2 line "why it matches".
  return args.fallback;
}
