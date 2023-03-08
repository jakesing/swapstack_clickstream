import type { Knex } from "knex";

import IEventDBRow from "../interfaces/IEventDBRow";

import * as dbUtils from "../utils/db.helpers";

import * as systemConstants from "../constants/system";

const parentTableName = "clickstream_events_parent";
const childTableName = "clickstream_events_child";

import * as apiExceptions from "../exceptions/api";

export const logEvents = async (rows: IEventDBRow[]): Promise<boolean> => {
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

export const fetchAnalytics = async ({
  startDate,
  endDate,
  links = [],
  groupByColumn = null,
  groupByValue = null,
}: {
  startDate: Date;
  endDate: Date;
  links?: string[];
  groupByColumn?: string;
  groupByValue?: string;
}) => {
  try {
    const knex = dbUtils.fetchDb();

    const query: Knex.QueryBuilder = knex(parentTableName);

    let groupByQuery: string;

    switch (groupByColumn) {
      case systemConstants.GROUP_BY_COLUMNS.DATE:
        switch (groupByValue) {
          case systemConstants.GROUP_BY_VALUES.YEAR:
            groupByQuery = "DATE_FORMAT(log_date, '%Y')";
            break;

          case systemConstants.GROUP_BY_VALUES.MONTH:
            groupByQuery = "DATE_FORMAT(log_date, '%M')";
            break;

          case systemConstants.GROUP_BY_VALUES.WEEK:
            groupByQuery = "DATE_FORMAT(log_date, '%W')";
            break;

          case systemConstants.GROUP_BY_VALUES.DAY:
            groupByQuery = "DATE_FORMAT(log_date, '%d')";
            break;

          case systemConstants.GROUP_BY_VALUES.HOUR:
            groupByQuery = "DATE_FORMAT(log_date, '%k')";
            break;

          default:
            throw apiExceptions.invalidGroupByClause;
        }
        break;

      default:
        break;
    }

    query.select(
      knex.raw(`${groupByQuery} as date`),
      knex.raw("SUM(CASE when agent_type = 'human' then 1 else 0 end) total_clicks"),
      knex.raw(
        "SUM(CASE when agent_type = 'human' and is_first_session = 1 then 1 else 0 end) unique_clicks",
      ),
      knex.raw("SUM(CASE when agent_type = 'bot' then 1 else 0 end) bot_total"),
      knex.raw(
        "SUM(CASE when agent_type = 'bot' and is_first_session = 1 then 1 else 0 end) bot_unique",
      ),
    );

    query.groupByRaw(groupByQuery);

    if (startDate) query.where("log_date", ">=", startDate);
    if (endDate) query.andWhere("log_date", "<=", endDate);
    if (links?.length > 0) query.whereIn("route_id", links);

    const rows = await query;

    return rows;
  } catch (error) {
    throw error;
  }
};
