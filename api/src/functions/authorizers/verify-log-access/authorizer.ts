import { AuthResponse, APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const createPolicy = function (
  principalId: string,
  effect: string,
  resource: string
): AuthResponse {
  let response = {
    principalId: principalId,
  } as AuthResponse;

  if (effect && resource) {
    response.policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    };
  }

  response.context = {
    sub: principalId,
  };

  return response;
};

const verifier = CognitoJwtVerifier.create({
  region: process.env.AWS_REGION,
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
  tokenUse: "id",
});

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION,
  })
);

export const handler = async (event: APIGatewayRequestAuthorizerEvent) => {
  try {
    const token = event.headers.Authorization;
    const { sub } = await verifier.verify(token);
    const { Item } = await client.send(
      new GetCommand({
        TableName: process.env.MOOD_VAULT_TABLE,
        Key: {
          pk: `LOG_GROUP_ACCESS_PRINCIPLE#${sub}`,
          sk: event.pathParameters.logGroupId,
        },
      })
    );
    if (!Item) {
      return createPolicy("", "Deny", event.methodArn);
    } else {
      return createPolicy(sub, "Allow", event.methodArn);
    }
  } catch (e) {
    console.log(e);
    return createPolicy("", "Deny", event.methodArn);
  }
};
