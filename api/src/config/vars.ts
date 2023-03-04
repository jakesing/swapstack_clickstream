import * as dotenv from "dotenv";

dotenv.config();

const config = {
  region: process.env.REGION,
  bucket: process.env.BUCKET,
  environment: process.env.ENVIRONMENT,
  isLocal: process.env.ENVIRONMENT === "local",
  isStage: process.env.ENVIRONMENT === "stage",
  isRelease: process.env.ENVIRONMENT === "live",
};

export default config;
