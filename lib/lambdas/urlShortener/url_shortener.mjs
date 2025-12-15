import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "crypto";

const { region, table_name } = process.env;

const client = new DynamoDBClient({ region });
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const { original_url, ttl } = JSON.parse(event.body || {});
  const short_url = randomBytes(8).toString("base64url");

  // TTL = 24 hours
  const current_time = Math.floor(new Date().getTime() / 1000);
  const expire_at =
    ttl === 0
      ? Number.MAX_SAFE_INTEGER
      : Math.floor((new Date().getTime() + ttl) / 1000);

  const putItem = new PutCommand({
    TableName: table_name,
    Item: {
      short_url,
      original_url,
      current_time,
      expire_at,
    },
  });

  await db.send(putItem);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ short_url }),
  };
};
