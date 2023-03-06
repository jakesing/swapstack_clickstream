// import * as dotenv from "dotenv";

// dotenv.config();

const config = {
  region: process.env.REGION,
  bucket: process.env.BUCKET,
  environment: process.env.ENVIRONMENT,
  isLocal: process.env.ENVIRONMENT === "local",
  isStage: process.env.ENVIRONMENT === "stage",
  isRelease: process.env.ENVIRONMENT === "live",
  dbHost: process.env.DB_HOST,
  dbPort: +process.env.DB_PORT,
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
};

export default config;
