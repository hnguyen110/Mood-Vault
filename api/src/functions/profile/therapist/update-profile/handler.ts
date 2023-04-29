import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

import schema from "./schema";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION,
  })
);

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    console.log(event);

    const item = {
      pk: `THERAPIST_PROFILE`,
      sk: `${event.requestContext.authorizer.claims.sub}`,
      ...event.body,
    };

    await client.send(
      new PutCommand({
        TableName: process.env.MOOD_VAULT_TABLE,
        Item: item,
      })
    );

    return formatJSONResponse({
      ...item,
    });
  } catch (e) {
    console.log(e);
    return formatJSONResponse({
      message: "Internal Server Error",
    });
  }
};

export const main = middyfy(handler);
