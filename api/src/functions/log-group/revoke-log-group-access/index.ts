import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        cors: true,
        method: "delete",
        path: "log-groups/{logGroupId}/access/{userId}",
        authorizer: {
          name: "verifyLogOnwership",
          type: "REQUEST",
          identitySource: "method.request.header.Authorization",
          resultTtlInSeconds: 0,
        },
      },
    },
  ],
};
