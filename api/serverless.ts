import type { AWS } from "@serverless/typescript";

import createLogGroup from "@functions/log-group/create-log-group";
import createLog from "@functions/log/create-log";
import getLog from "@functions/log/get-log";
import updateLog from "@functions/log/update-log";
import deleteLog from "@functions/log/delete-log";

const serverlessConfiguration: AWS = {
  service: "api",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    deploymentMethod: "direct",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      MOOD_VAULT_TABLE: {
        Ref: "MoodVaultBD98DB49",
      },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["dynamodb:*"],
            Resource: {
              "Fn::GetAtt": ["MoodVaultBD98DB49", "Arn"],
            },
          },
        ],
      },
    },
  },
  functions: { createLogGroup, createLog, getLog, updateLog, deleteLog },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      MoodVaultBD98DB49: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          KeySchema: [
            {
              AttributeName: "pk",
              KeyType: "HASH",
            },
            {
              AttributeName: "sk",
              KeyType: "RANGE",
            },
          ],
          AttributeDefinitions: [
            {
              AttributeName: "pk",
              AttributeType: "S",
            },
            {
              AttributeName: "sk",
              AttributeType: "S",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          TableName: "mood-vault",
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
        Metadata: {
          "aws:cdk:path": "IacStack/MoodVault/Resource",
        },
      },
      UserPool6BA7E5F2: {
        Type: "AWS::Cognito::UserPool",
        Properties: {
          AccountRecoverySetting: {
            RecoveryMechanisms: [
              {
                Name: "verified_email",
                Priority: 1,
              },
            ],
          },
          AdminCreateUserConfig: {
            AllowAdminCreateUserOnly: false,
          },
          AutoVerifiedAttributes: ["email"],
          EmailVerificationMessage:
            "The verification code to your new account is {####}",
          EmailVerificationSubject: "Verify your new account",
          Policies: {
            PasswordPolicy: {
              MinimumLength: 8,
              RequireLowercase: true,
              RequireNumbers: true,
              RequireSymbols: true,
              RequireUppercase: true,
            },
          },
          Schema: [
            {
              Mutable: false,
              Name: "email",
              Required: true,
            },
          ],
          SmsVerificationMessage:
            "The verification code to your new account is {####}",
          UsernameAttributes: ["email"],
          UserPoolName: "user-pool",
          VerificationMessageTemplate: {
            DefaultEmailOption: "CONFIRM_WITH_CODE",
            EmailMessage: "The verification code to your new account is {####}",
            EmailSubject: "Verify your new account",
            SmsMessage: "The verification code to your new account is {####}",
          },
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
        Metadata: {
          "aws:cdk:path": "IacStack/UserPool/Resource",
        },
      },
      UserPoolCognitoDomainD6C7F9FA: {
        Type: "AWS::Cognito::UserPoolDomain",
        Properties: {
          Domain: "mood-vault",
          UserPoolId: {
            Ref: "UserPool6BA7E5F2",
          },
        },
        Metadata: {
          "aws:cdk:path": "IacStack/UserPool/CognitoDomain/Resource",
        },
      },
      UserPoolClient2F5918F7: {
        Type: "AWS::Cognito::UserPoolClient",
        Properties: {
          UserPoolId: {
            Ref: "UserPool6BA7E5F2",
          },
          AllowedOAuthFlows: ["implicit", "code"],
          AllowedOAuthFlowsUserPoolClient: true,
          AllowedOAuthScopes: ["email", "openid", "profile"],
          CallbackURLs: ["http://localhost:3000/"],
          ClientName: "user-pool-client",
          ExplicitAuthFlows: [
            "ALLOW_USER_PASSWORD_AUTH",
            "ALLOW_USER_SRP_AUTH",
            "ALLOW_REFRESH_TOKEN_AUTH",
          ],
          GenerateSecret: false,
          LogoutURLs: ["http://localhost:3000/"],
          PreventUserExistenceErrors: "ENABLED",
          SupportedIdentityProviders: ["COGNITO"],
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
        Metadata: {
          "aws:cdk:path": "IacStack/UserPoolClient/Resource",
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
