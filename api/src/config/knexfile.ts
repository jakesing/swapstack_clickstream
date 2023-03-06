import type { Knex } from "knex";
// import * as dotenv from "dotenv";
import * as path from "path";

// dotenv.config({
//   path: path.join(__dirname, "../../.env"),
// });

const HOST: string = process.env.DB_HOST;
const PORT: number = +process.env.DB_PORT;
const USERNAME: string = process.env.DB_USERNAME;
const PASSWORD: string = process.env.DB_PASSWORD;
const NAME: string = process.env.DB_NAME;

const migrationsDir = path.join(__dirname, "../migrations");
const seedsDir = path.join(__dirname, "../seeds");

const connection: Knex.MySqlConnectionConfig = {
  host: HOST,
  port: PORT,
  user: USERNAME,
  password: PASSWORD,
  database: NAME,
};

const commonConfig = {
  client: "mysql2",
  debug: true,
  useNullAsDefault: true,
  connection: connection,
  pool: { min: 1, max: 5 },
  migrations: {
    // directory: "./src/migrations",
    directory: migrationsDir,
  },
  seeds: {
    // directory: "./src/seeds",
    directory: seedsDir,
  },
};

const config: { [key: string]: Knex.Config } = {
  local: {
    ...commonConfig,
    pool: { min: 2, max: 20 },
  },
  stage: {
    ...commonConfig,
  },
  live: {
    ...commonConfig,
    debug: false,
  },
};

// module.exports = config;
export default config;
