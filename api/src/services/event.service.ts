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
            groupByQuery = "YEAR(log_date)";
            break;

          case systemConstants.GROUP_BY_VALUES.QUARTER:
            groupByQuery = "QUARTER(log_date)";
            break;

          case systemConstants.GROUP_BY_VALUES.MONTH:
            groupByQuery = "MONTH(log_date)";
            break;

          case systemConstants.GROUP_BY_VALUES.WEEK:
            groupByQuery = "WEEK(log_date)";
            break;

          case systemConstants.GROUP_BY_VALUES.DAY:
            groupByQuery = "DAY(log_date)";
            break;

          case systemConstants.GROUP_BY_VALUES.DATE:
            groupByQuery = "DATE(log_date)";
            break;

          case systemConstants.GROUP_BY_VALUES.HOUR:
            groupByQuery = "HOUR(log_date)";
            break;

          default:
            throw apiExceptions.invalidGroupByClause;
        }
        break;

      case systemConstants.GROUP_BY_COLUMNS.LINKS:
        groupByQuery = "route_id";
        break;

      case systemConstants.GROUP_BY_COLUMNS.COUNTRY:
        groupByQuery = "country";
        break;

      case systemConstants.GROUP_BY_COLUMNS.OS:
        groupByQuery = "os";
        break;

      case systemConstants.GROUP_BY_COLUMNS.LANGUAGE:
        groupByQuery = "language";
        break;

      case systemConstants.GROUP_BY_COLUMNS.BROWSER:
        groupByQuery = "browser";
        break;

      case systemConstants.GROUP_BY_COLUMNS.DEVICE:
        groupByQuery = "device";
        break;

      case systemConstants.GROUP_BY_COLUMNS.REFERRER:
        groupByQuery = "referrer";
        break;

      default:
        break;
    }

    if (groupByQuery) {
      query.groupByRaw(groupByQuery).orderByRaw(`${groupByQuery} DESC`);
    } else {
      groupByQuery = "COUNT(*)";
    }

    query.select(
      // knex.raw(`count(*) as total`),
      knex.raw(`${groupByQuery} as label`),
      knex.raw("SUM(CASE when agent_type = 'human' then 1 else 0 end) total_clicks"),
      knex.raw(
        "SUM(CASE when agent_type = 'human' and is_first_session = 1 then 1 else 0 end) unique_clicks",
      ),
      knex.raw("SUM(CASE when agent_type = 'bot' then 1 else 0 end) bot_total"),
      knex.raw(
        "SUM(CASE when agent_type = 'bot' and is_first_session = 1 then 1 else 0 end) bot_unique",
      ),
    );

    if (startDate) query.where("log_date", ">=", startDate);
    if (endDate) query.andWhere("log_date", "<=", endDate);
    if (links?.length > 0) query.whereIn("route_id", links);

    let rows = await query;

    if (rows?.length === 1) {
      const row = rows?.[0];

      if (`${row?.label}` === "0")
        rows = [
          {
            label: 0,
            total_clicks: "0",
            unique_clicks: "0",
            bot_total: "0",
            bot_unique: "0",
          },
        ];
    }

    return rows;
  } catch (error) {
    throw error;
  }
};
