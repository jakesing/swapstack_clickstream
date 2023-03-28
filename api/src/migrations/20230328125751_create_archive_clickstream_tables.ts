import { Knex } from "knex";

const parentTableName = "archived_clickstream_events_parent";
const childTableName = "archived_clickstream_events_child";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable(parentTableName, (table) => {
      table.integer("id").unsigned().primary();

      table.dateTime("log_date", { useTz: true });
      table.integer("log_date_unix", 11).nullable().defaultTo(null);
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
    })
    .then(() => {
      return knex.schema.createTable(childTableName, (table) => {
        table.integer("id").unsigned().primary();

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
        table.string("route_workspace_id").nullable().defaultTo(null);
        table.string("route_workspace_name");
        table.string("route_domain_id");
        table.string("route_domain_raw", 4096);
        table.string("route_domain_zone");
        table.string("route_destination_raw", 4096);
        table.string("route_destination_protocol");
        table.string("tag_id", 512).nullable().defaultTo(null);
        table.string("tag_value").nullable().defaultTo(null);
        table.dateTime("createdAt", { useTz: true }).defaultTo(knex.fn.now());
        table.dateTime("updatedAt", { useTz: true }).defaultTo(knex.fn.now());
      });
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(childTableName).then(() => {
    return knex.schema.dropTable(parentTableName);
  });
}
