import { Knex } from "knex";

const up = (knex: Knex) => {
  return Promise.all([
    knex.schema.table("clickstream_events_child", (table) => {
      table.string("tag_id", 512).nullable().defaultTo(null);
      table.string("tag_value").nullable().defaultTo(null);
    }),
  ]);
};

const down = (knex: Knex) => {
  return Promise.all([
    knex.schema.table("clickstream_events_child", (table) => {
      table.dropColumns("tag_id");
      table.dropColumns("tag_value");
    }),
  ]);
};

module.exports = {
  up,
  down,
};
