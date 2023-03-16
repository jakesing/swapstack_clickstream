import { Knex } from "knex";

const up = (knex: Knex) => {
  return Promise.all([
    knex.schema.table("clickstream_events_child", (table) => {
      table.string("route_workspace_id").nullable().defaultTo(null).after("route_creator_name");
    }),
  ]);
};

const down = (knex: Knex) => {
  return Promise.all([
    knex.schema.table("clickstream_events_child", (table) => {
      table.dropColumns("route_workspace_id");
    }),
  ]);
};

module.exports = {
  up,
  down,
};
