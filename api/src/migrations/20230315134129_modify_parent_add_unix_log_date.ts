import { Knex } from "knex";

const up = (knex: Knex) => {
  return Promise.all([
    knex.schema.table("clickstream_events_parent", (table) => {
      table.integer("log_date_unix", 11).nullable().defaultTo(null).after("log_date").index();

      table.dropIndex("log_date");
    }),
  ]);
};

const down = (knex: Knex) => {
  return Promise.all([
    knex.schema.table("clickstream_events_parent", (table) => {
      table.dropColumns("log_date_unix");

      table.index("log_date");
    }),
  ]);
};

module.exports = {
  up,
  down,
};
