import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const { region, table_name } = process.env;

const client = new DynamoDBClient({ region });
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: {},
  };

  const { short_url } = event.queryStringParameters;
  const getItem = new GetCommand({
    TableName: table_name,
    Key: {
      short_url,
    },
  });

  const now = Math.floor(new Date().getTime() / 1000);
  const dbResponse = await db.send(getItem);
  const isExpired = Number(dbResponse?.Item?.expire_at) < now;
  if (!dbResponse) {
    response = {
      ...response,
      statusCode: 404,
      body: JSON.stringify({
        error: "URL not found, it may have already expired!",
      }),
    };
    return response;
  } else if (isExpired) {
    response = {
      ...response,
      statusCode: 420,
      body: JSON.stringify({
        error: "URL expired!",
      }),
    };
    return response;
  }

  return {
    ...response,
    body: JSON.stringify(dbResponse.Item),
  };
};
