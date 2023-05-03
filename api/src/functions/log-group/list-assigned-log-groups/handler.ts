import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION,
  })
);

const handler: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  try {
    console.log(event);

    const params: QueryCommandInput = {
      TableName: process.env.MOOD_VAULT_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `LOG_GROUP_ACCESS_PRINCIPLE#${event.requestContext.authorizer.claims.sub}`,
      },
    };

    if (
      event.queryStringParameters &&
      "key" in event?.queryStringParameters &&
      event?.queryStringParameters?.key !== ""
    ) {
      params.ExclusiveStartKey = {
        pk: `LOG_GROUP_ACCESS_PRINCIPLE#${event.requestContext.authorizer.claims.sub}`,
        sk: event.queryStringParameters.key,
      };
    }

    if (
      event.queryStringParameters &&
      "limit" in event?.queryStringParameters
    ) {
      params.Limit = parseInt(event.queryStringParameters.limit);
    }

    const { Items, LastEvaluatedKey } = await client.send(
      new QueryCommand(params)
    );

    return formatJSONResponse({
      logGroups: Items,
      key: LastEvaluatedKey?.sk,
    });
  } catch (e) {
    console.log(e);
    return formatJSONResponse({
      message: "Internal Server Error",
    });
  }
};

export const main = middyfy(handler);
