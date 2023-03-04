import type { AWS } from "@serverless/typescript";

import process from "@functions/process";

const serverlessConfiguration: AWS = {
  service: "swapstack-rebrandly-s3-parser",
  frameworkVersion: "3",
  configValidationMode: "error",
  plugins: ["serverless-esbuild", "serverless-offline", "serverless-prune-plugin"],
  useDotenv: true,
  provider: {
    name: "aws",
    runtime: "nodejs16.x",
    architecture: "arm64",
    memorySize: 1024,
    timeout: 30, // 30 seconds
    logRetentionInDays: 5,
    stage: "${opt:stage}",
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      REGION: "${opt:region}",
      ENVIRONMENT: "${env:ENVIRONMENT}",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:GetObjectVersion", "s3:GetObjectAcl", "s3:ListBucket"],
            Resource: "arn:aws:s3:::swapstack-rebrandly-clickstream/*",
          },
        ],
      },
    },
  },
  functions: { process },
  package: { individually: true },
  resources: {
    Resources: {
      clickEventS3Queue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${env:ENVIRONMENT}_click_event_s3",
          ReceiveMessageWaitTimeSeconds: 20,
          VisibilityTimeout: 120, // seconds
        },
      },
    },
  },
  custom: {
    prune: {
      automatic: true,
      number: 3,
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: false,
      exclude: ["aws-sdk"],
      target: "node16",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    ["serverless-offline"]: {
      httpPort: 3000,
      babelOptions: {
        presets: ["env"],
      },
    },
  },
};

module.exports = serverlessConfiguration;
