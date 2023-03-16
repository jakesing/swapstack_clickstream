import type { Knex } from "knex";

import IEventDBRow from "../interfaces/IEventDBRow";

import * as dbUtils from "../utils/db.helpers";

import * as systemConstants from "../constants/system";

const parentTableName = "clickstream_events_parent";
const childTableName = "clickstream_events_child";

import * as apiExceptions from "../exceptions/api";

export const logEvents = async (rows: IEventDBRow[]): Promise<number[]> => {
  try {
    const knex = dbUtils.fetchDb();

    const ids: number[] = [];
    await Promise.all(
      rows.map(async (row) => {
        try {
          const parentId: number[] = await knex(parentTableName).insert(row.parent, "id");

          ids.push(parentId[0]);

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

    return ids;
  } catch (error) {
    throw error;
  }
};

export const fetchAnalytics = async ({
  startDate,
  endDate,
  links = [],
  tags = [],
  workspaces = [],
  groupByColumn = null,
  groupByValue = null,
}: {
  startDate: Date;
  endDate: Date;
  tags?: string[];
  links?: string[];
  workspaces?: string[];
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
            groupByQuery = "YEAR(FROM_UNIXTIME(log_date_unix))";
            break;

          case systemConstants.GROUP_BY_VALUES.QUARTER:
            groupByQuery = "QUARTER(FROM_UNIXTIME(log_date_unix))";
            break;

          case systemConstants.GROUP_BY_VALUES.MONTH:
            groupByQuery = "MONTH(FROM_UNIXTIME(log_date_unix))";
            break;

          case systemConstants.GROUP_BY_VALUES.WEEK:
            groupByQuery = "WEEK(FROM_UNIXTIME(log_date_unix))";
            break;

          case systemConstants.GROUP_BY_VALUES.DAY:
            groupByQuery = "DAY(FROM_UNIXTIME(log_date_unix))";
            break;

          case systemConstants.GROUP_BY_VALUES.DATE:
            groupByQuery = "DATE(FROM_UNIXTIME(log_date_unix))";
            break;

          case systemConstants.GROUP_BY_VALUES.HOUR:
            groupByQuery = "HOUR(FROM_UNIXTIME(log_date_unix))";
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

    if (startDate) query.where("log_date_unix", ">=", startDate.getTime() / 1000);
    if (endDate) query.andWhere("log_date_unix", "<=", endDate.getTime() / 1000);
    if (links?.length > 0) query.whereIn("route_id", links);

    if (tags?.length > 0 || workspaces?.length > 0) {
      // join the child table as well
      query.leftJoin(childTableName, `${parentTableName}.id`, `${childTableName}.id_parent`);

      if (tags?.length > 0) query.whereIn("tag_id", tags);
      if (workspaces?.length > 0) query.whereIn("route_workspace_id", workspaces);
    }

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
