import schema from "./schema";
import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        cors: true,
        method: "post",
        path: "log-groups/{logGroupId}/access",
        request: {
          schemas: {
            "application/json": schema,
          },
        },
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
