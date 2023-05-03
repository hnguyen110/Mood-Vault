import { TextDecoder, TextEncoder } from "util";
import { DynamoDBRecord, SNSEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  SageMakerRuntimeClient,
  InvokeEndpointCommand,
} from "@aws-sdk/client-sagemaker-runtime";

const dynamodbClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION,
  })
);

const smClient = new SageMakerRuntimeClient({
  region: process.env.AWS_REGION,
});

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const handler = async (event: SNSEvent) => {
  console.log(event);

  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.Sns.Message) as DynamoDBRecord;

      if (
        message.eventName !== "REMOVE" &&
        message.dynamodb.NewImage.pk.S.match(/^SUB#.*#LOG_GROUP#.*#LOG$/g)
      ) {
        const { Body } = await smClient.send(
          new InvokeEndpointCommand({
            EndpointName: process.env.SAGEMAKER_SUMMARIZER_ENDPOINT_NAME,
            ContentType: "application/x-text",
            Accept: "application/json",
            Body: encoder.encode(message.dynamodb.NewImage.data.S),
          })
        );

        await dynamodbClient.send(
          new PutCommand({
            TableName: process.env.MOOD_VAULT_TABLE,
            Item: {
              pk: `LOG_SUMMARY`,
              sk: message.dynamodb.NewImage.sk.S,
              ...JSON.parse(decoder.decode(Body)),
            },
          })
        );
      }
    }
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const main = handler;
