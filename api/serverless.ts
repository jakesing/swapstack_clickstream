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
    memorySize: 512,
    timeout: 30, // 30 seconds
    logRetentionInDays: 3,
    stage: "${opt:stage}",
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      REGION: "${opt:region}",
      ENVIRONMENT: "${env:ENVIRONMENT}",
      BUCKET: "${env:BUCKET}",
      DB_HOST: "${env:DB_HOST}",
      DB_PORT: "${env:DB_PORT}",
      DB_USERNAME: "${env:DB_USERNAME}",
      DB_PASSWORD: "${env:DB_PASSWORD}",
      DB_NAME: "${env:DB_NAME}",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:GetObjectVersion", "s3:GetObjectAcl", "s3:ListBucket"],
            Resource: "arn:aws:s3:::swapstack-rebrandly-clickstream/*",
          },
          {
            Effect: "Allow",
            Action: ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"],
            Resource:
              "arn:aws:sqs:${opt:region}:${aws:accountId}:${env:ENVIRONMENT}_click_event_s3_queue",
          },
        ],
      },
    },
  },
  functions: { process },
  package: { individually: true },
  custom: {
    prune: {
      automatic: true,
      number: 3,
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: false,
      exclude: [
        // "aws-sdk",
        "mysql",
        "better-sqlite3",
        "tedious",
        "oracledb",
        "oracledb",
        "pg",
        "pg-query-stream",
        "sqlite3",
      ],
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
