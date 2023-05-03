import type { AWS } from "@serverless/typescript";

import * as functions from "@functions/index";

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
      OPENSEARCH_ENDPOINT:
        "https://search-mood-vault-cnrgad6x636aodc5esxnygnv4a.us-east-1.es.amazonaws.com",
      OPENSEARCH_USERNAME: "opensearch",
      OPENSEARCH_PASSWORD: "AduVwv0fXt73#KMLfE62T@l%@z#br801#%MEmh8vAC8%zZ@q0k",
      OPENSEARCH_INDEX: "moodvault",
      COGNITO_USER_POOL_ID: {
        Ref: "UserPool6BA7E5F2",
      },
      COGNITO_CLIENT_ID: {
        Ref: "UserPoolClient2F5918F7",
      },
      SAGEMAKER_SUMMARIZER_ENDPOINT_NAME:
        "jumpstart-example-huggingface-summariza-2023-05-02-20-38-36-023",
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
          {
            Effect: "Allow",
            Action: ["es:*"],
            Resource: "*",
          },
          {
            Effect: "Allow",
            Action: ["comprehend:*"],
            Resource: "*",
          },
          {
            Effect: "Allow",
            Action: "sagemaker:InvokeEndpoint",
            Resource: "*",
          },
        ],
      },
    },
  },
  functions: functions,
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
      DEFAULT4XXB6DED634: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseType: "DEFAULT_4XX",
          RestApiId: {
            Ref: "ApiGatewayRestApi",
          },
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Methods": "'*'",
          },
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
      },
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
          StreamSpecification: {
            StreamViewType: "NEW_AND_OLD_IMAGES",
          },
          TableName: "mood-vault",
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
        Metadata: {
          "aws:cdk:path": "IacStack/MoodVault/Resource",
        },
      },
      TopicBFC7AF6E: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "mood-vault",
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
        Metadata: {
          "aws:cdk:path": "IacStack/Topic/Resource",
        },
      },
      PipeRole4D7B8476: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {
            Statement: [
              {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                  Service: "pipes.amazonaws.com",
                },
              },
            ],
            Version: "2012-10-17",
          },
          Policies: [
            {
              PolicyDocument: {
                Statement: [
                  {
                    Action: "sns:Publish",
                    Effect: "Allow",
                    Resource: {
                      Ref: "TopicBFC7AF6E",
                    },
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName: "sns-publish",
            },
            {
              PolicyDocument: {
                Statement: [
                  {
                    Action: [
                      "dynamodb:DescribeStream",
                      "dynamodb:GetRecords",
                      "dynamodb:GetShardIterator",
                      "dynamodb:ListStreams",
                    ],
                    Effect: "Allow",
                    Resource: {
                      "Fn::GetAtt": ["MoodVaultBD98DB49", "StreamArn"],
                    },
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName: "dynamodb-stream",
            },
          ],
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
        Metadata: {
          "aws:cdk:path": "IacStack/PipeRole/Resource",
        },
      },
      Pipe: {
        Type: "AWS::Pipes::Pipe",
        Properties: {
          RoleArn: {
            "Fn::GetAtt": ["PipeRole4D7B8476", "Arn"],
          },
          Source: {
            "Fn::GetAtt": ["MoodVaultBD98DB49", "StreamArn"],
          },
          Target: {
            Ref: "TopicBFC7AF6E",
          },
          SourceParameters: {
            DynamoDBStreamParameters: {
              StartingPosition: "TRIM_HORIZON",
            },
          },
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
        Metadata: {
          "aws:cdk:path": "IacStack/Pipe",
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
