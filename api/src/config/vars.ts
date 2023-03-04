import * as dotenv from "dotenv";

dotenv.config();

const config = {
  environment: process.env.ENVIRONMENT,
  isLocal: process.env.ENVIRONMENT === "local",
  isStage: process.env.ENVIRONMENT === "stage",
  isRelease: process.env.ENVIRONMENT === "live",
};

export default config;
