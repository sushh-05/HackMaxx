import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const REGION = process.env.AWS_REGION ?? "ap-south-1";
const EMBED_MODEL = process.env.BEDROCK_EMBED_MODEL ?? "amazon.titan-embed-text-v2:0";
const LLM_MODEL = process.env.BEDROCK_LLM_MODEL ?? "anthropic.claude-3-haiku-20240307-v1:0";

const client = new BedrockRuntimeClient({ region: REGION });

export async function embedText(text: string): Promise<number[] | null> {
  try {
    const res = await client.send(new InvokeModelCommand({
      modelId: EMBED_MODEL,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({ inputText: text }),
    }));
    const body = JSON.parse(new TextDecoder().decode(res.body));
    return body.embedding as number[];
  } catch {
    return null;
  }
}

export async function explainMatch(args: {
  projectTitle: string;
  hackathonTitle: string;
  fallback: string;
}): Promise<string> {
  try {
    const prompt = `Project: "${args.projectTitle}"\nHackathon: "${args.hackathonTitle}"\nIn one sentence, explain why this project is a strong match for this hackathon and what minimal adaptation is needed.`;
    const res = await client.send(new InvokeModelCommand({
      modelId: LLM_MODEL,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 120,
        messages: [{ role: "user", content: prompt }],
      }),
    }));
    const body = JSON.parse(new TextDecoder().decode(res.body));
    return body.content?.[0]?.text?.trim() ?? args.fallback;
  } catch {
    return args.fallback;
  }
}
