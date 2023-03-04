import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("clickstream_events_child", (table) => {
    table.increments("id").primary();
    table.integer("id_parent");
    table.string("region");
    table.string("os_version");
    table.dateTime("session_start_date", { useTz: true });
    table.string("referrer_protocol");
    table.string("referrer_path");
    table.string("route_slash_tag");
    table.string("route_creator_id");
    table.string("route_creator_name");
    table.string("route_workspace_name");
    table.string("route_domain_id");
    table.string("route_domain_raw");
    table.string("route_domain_zone");
    table.string("route_destination_raw");
    table.string("route_destination_protocol");
    table.dateTime("createdAt", { useTz: true }).defaultTo(knex.fn.now());
    table.dateTime("updatedAt", { useTz: true }).defaultTo(knex.fn.now());

    table.foreign("id_parent").references("clickstream_events_parent.id");
    table.index("id_parent");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("clickstream_events_child");
}
