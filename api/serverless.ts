import type { AWS } from "@serverless/typescript";

import sync from "@functions/sync";

const serverlessConfiguration: AWS = {
  service: "swapstack-rebrandly-s3-parser",
  frameworkVersion: "3",
  configValidationMode: "error",
  plugins: ["serverless-esbuild", "serverless-offline"],
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
  },
  functions: { sync },
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
