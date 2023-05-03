import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        cors: true,
        method: "get",
        path: "log-groups/{logGroupId}/logs/{logId}",
        authorizer: {
          name: "authorizer",
          type: "COGNITO_USER_POOLS",
          arn: {
            "Fn::GetAtt": ["UserPool6BA7E5F2", "Arn"],
          },
          identitySource: "method.request.header.Authorization",
          resultTtlInSeconds: 0,
        },
      },
    },
  ],
};
