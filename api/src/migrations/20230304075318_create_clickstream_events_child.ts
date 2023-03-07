import { Knex } from "knex";

import config from "../config/vars";

const parentTableName = config.isRelease
  ? "clickstream_events_parent"
  : `${config.environment}_clickstream_events_parent`;

const tableName = config.isRelease
  ? "clickstream_events_child"
  : `${config.environment}_clickstream_events_child`;

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (table) => {
    table.increments("id").primary();

    table
      .integer("id_parent")
      .unsigned()
      .index()
      .references("id")
      .inTable(parentTableName)
      .onDelete("CASCADE");
    table.string("region");
    table.string("os_version");
    table.dateTime("session_start_date", { useTz: true });
    table.string("referrer_protocol");
    table.string("referrer_path", 4096);
    table.string("route_slash_tag");
    table.string("route_creator_id");
    table.string("route_creator_name");
    table.string("route_workspace_name");
    table.string("route_domain_id");
    table.string("route_domain_raw", 4096);
    table.string("route_domain_zone");
    table.string("route_destination_raw", 4096);
    table.string("route_destination_protocol");
    table.dateTime("createdAt", { useTz: true }).defaultTo(knex.fn.now());
    table.dateTime("updatedAt", { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
