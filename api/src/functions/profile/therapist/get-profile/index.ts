import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "profile/therapist",
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
