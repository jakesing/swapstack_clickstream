import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("clickstream_events_parent", (table) => {
    table.increments("id").primary();
    table.dateTime("log_date", { useTz: true });
    table.string("language");
    table.string("country");
    table.string("agent_type");
    table.string("browser");
    table.string("os");
    table.string("device");
    table.string("referrer");
    table.boolean("is_first_session");
    table.string("route_id");
    table.string("route_workspace_id");
    table.dateTime("createdAt", { useTz: true }).defaultTo(knex.fn.now());
    table.dateTime("updatedAt", { useTz: true }).defaultTo(knex.fn.now());

    table.index("log_date");
    table.index("language");
    table.index("country");
    table.index("agent_type");
    table.index("browser");
    table.index("os");
    table.index("device");
    table.index("is_first_session");
    table.index("route_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("clickstream_events_parent");
}
