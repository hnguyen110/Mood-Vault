import { DynamoDBRecord, SNSEvent } from "aws-lambda";
import {
  ComprehendClient,
  DetectSentimentCommand,
} from "@aws-sdk/client-comprehend";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const comprehendClient = new ComprehendClient({
  region: process.env.AWS_REGION,
});

const dynamodbClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION,
  })
);

const handler = async (event: SNSEvent) => {
  console.log(event);

  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.Sns.Message) as DynamoDBRecord;
      if (
        message.eventName !== "REMOVE" &&
        message.dynamodb.NewImage.pk.S.match(/^SUB#.*#LOG_GROUP#.*#LOG$/g)
      ) {
        const { Sentiment, SentimentScore } = await comprehendClient.send(
          new DetectSentimentCommand({
            LanguageCode: "en",
            Text: message.dynamodb.NewImage.data.S,
          })
        );

        await dynamodbClient.send(
          new PutCommand({
            TableName: process.env.MOOD_VAULT_TABLE,
            Item: {
              pk: `LOG_SENTIMENT`,
              sk: message.dynamodb.NewImage.sk.S,
              sentiment: Sentiment,
              sentimentScore: SentimentScore,
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
