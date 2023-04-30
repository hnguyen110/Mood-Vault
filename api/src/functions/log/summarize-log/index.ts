import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "log-groups/{logGroupId}/logs/{logId}/summarize",
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
