import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION,
  })
);

const handler: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  try {
    console.log(event);

    const { Item } = await client.send(
      new GetCommand({
        TableName: process.env.MOOD_VAULT_TABLE,
        Key: {
          pk: "THERAPIST_PROFILE",
          sk: `${event.requestContext.authorizer.claims.sub}`,
        },
      })
    );

    return formatJSONResponse({
      ...Item,
    });
  } catch (e) {
    console.log(e);
    return formatJSONResponse({
      message: "Internal Server Error",
    });
  }
};

export const main = middyfy(handler);
