import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { readFileSync } from "fs";
import { resolve } from "path";

const TABLE = process.env.TABLE_NAME ?? "Hackathons-hackmaxx";
const REGION = process.env.AWS_REGION ?? "ap-south-1";

const client = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(client);

const csvPath = resolve(import.meta.dir, "../data/seed.csv");
const lines = readFileSync(csvPath, "utf-8").trim().split("\n");
const headers = lines[0].replace(/\r/g, "").split(",");

let seeded = 0;
for (const line of lines.slice(1)) {
    const values = line.replace(/\r/g, "").split(",");
    const row: Record<string, string | number | string[]> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));

    const item = {
        id: row.id as string,
        title: row.title as string,
        url: row.url as string,
        platform: row.platform as string,
        deadline: row.deadline as string,
        prize_inr: Number(row.prize_inr),
        tech_tags: (row.tech_tags as string).split("|"),
        mode: row.mode as string,
        description: row.description as string,
        reputation_score: Number(row.reputation_score),
        difficulty_score: Number(row.difficulty_score),
    };

    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
    console.log(`✓ ${item.id} — ${item.title}`);
    seeded++;
}

console.log(`\nSeeded ${seeded} hackathons into ${TABLE}`);
