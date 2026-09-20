import type { Hackathon } from "@hackmaxx/shared";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.HACKATHONS_TABLE ?? "";
const ddb = TABLE
  ? DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-south-1" }))
  : null;

export async function listHackathons(): Promise<Hackathon[]> {
  if (!ddb) return [];
  try {
    const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
    return (result.Items ?? []) as Hackathon[];
  } catch {
    return [];
  }
}

export async function upsertHackathon(h: Hackathon): Promise<void> {
  if (!ddb) return;
  await ddb.send(new PutCommand({ TableName: TABLE, Item: h }));
}

