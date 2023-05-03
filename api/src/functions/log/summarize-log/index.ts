import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        cors: true,
        method: "get",
        path: "log-groups/{logGroupId}/logs/{logId}/summary",
        authorizer: {
          name: "verifyLogAccess",
          type: "REQUEST",
          identitySource: "method.request.header.Authorization",
          resultTtlInSeconds: 0,
        },
      },
    },
  ],
};
