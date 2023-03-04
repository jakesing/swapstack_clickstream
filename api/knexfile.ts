import type { Knex } from "knex";
import * as dotenv from "dotenv";

dotenv.config();

const HOST: string = process.env.DB_HOST;
const PORT: number = +process.env.DB_PORT;
const USERNAME: string = process.env.DB_USERNAME;
const PASSWORD: string = process.env.DB_PASSWORD;
const NAME: string = process.env.DB_NAME;

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
  migrations: {
    directory: "./src/migrations",
  },
  seeds: {
    directory: "./src/seeds",
  },
};

const config: { [key: string]: Knex.Config } = {
  local: {
    ...commonConfig,
  },
  development: {
    ...commonConfig,
  },
  production: {
    ...commonConfig,
    debug: false,
  },
};

module.exports = config;
export default config;
