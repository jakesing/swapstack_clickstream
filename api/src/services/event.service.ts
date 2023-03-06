import IEventDBRow from "../interfaces/IEventDBRow";

import * as dbUtils from "../utils/db.helpers";

import config from "../config/vars";

const parentTableName = config.isRelease
  ? "clickstream_events_parent"
  : `${config.environment}_clickstream_events_parent`;

const childTableName = config.isRelease
  ? "clickstream_events_child"
  : `${config.environment}_clickstream_events_child`;

export const logEvents = async (rows: IEventDBRow[]): Promise<boolean> => {
  console.log("🚀 ~ file: event.service.ts:16 ~ logEvents ~ rows:", rows.length);
  try {
    const knex = dbUtils.fetchDb();

    await Promise.all(
      rows.map(async (row) => {
        try {
          const parentId: number[] = await knex(parentTableName).insert(row.parent, "id");

          await knex(childTableName).insert(
            {
              ...row.child,
              id_parent: parentId[0],
            },
            "id",
          );

          return true;
        } catch (sqlError) {
          throw sqlError;
        }
      }),
    );

    return true;
  } catch (error) {
    throw error;
  }
};
