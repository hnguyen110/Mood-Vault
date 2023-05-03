import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sns: {
        arn: {
          Ref: "TopicBFC7AF6E",
        },
        topicName: "TopicBFC7AF6E",
      },
    },
  ],
};
