import { DynamoDBStreamEvent } from "aws-lambda";
import { Client } from "@opensearch-project/opensearch";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new Client({
  node: process.env.OPENSEARCH_ENDPOINT,
  auth: {
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
  },
});

const handler = async (event: DynamoDBStreamEvent) => {
  try {
    console.log(event);

    for (const record of event.Records) {
      if (record.eventName === "REMOVE") {
        await client.delete({
          index: process.env.OPENSEARCH_INDEX,
          id: record.dynamodb.OldImage.sk.S,
        });
      } else {
        await client.index({
          index: process.env.OPENSEARCH_INDEX,
          id: record.dynamodb.NewImage.sk.S,
          body: {
            ...unmarshall(record.dynamodb.NewImage as any),
          },
          refresh: true,
        });
      }
    }
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const main = handler;
