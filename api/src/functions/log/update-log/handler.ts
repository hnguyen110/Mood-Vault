import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

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
      pk: `SUB#${event.requestContext.authorizer.claims.sub}#LOG_GROUP#${event.pathParameters.logGroupId}#LOG`,
      sk: event.pathParameters.logId,
      ...event.body,
    };

    await client.send(
      new PutCommand({
        TableName: process.env.MOOD_VAULT_TABLE,
        Item: item,
      })
    );

    return formatJSONResponse({
      body: item,
    });
  } catch (e) {
    console.log(e);
    return formatJSONResponse({
      message: "Internal Server Error",
    });
  }
};

export const main = middyfy(handler);
