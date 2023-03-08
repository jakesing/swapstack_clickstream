import type { APIGatewayProxyEvent } from "aws-lambda";
import { zonedTimeToUtc, toDate } from "date-fns-tz";
import { parse, isValid } from "date-fns";

import { middyfyApi } from "@libs/lambda";

import * as apiExceptions from "../../exceptions/api";

import * as eventsService from "../../services/event.service";

import * as dbUtils from "../../utils/db.helpers";
import * as systemConstants from "../../constants/system";

const DATE_FORMAT = "MM/dd/yyyy HH:mm";

// initialise db
dbUtils.fetchDb();

const process = async (event: APIGatewayProxyEvent) => {
  try {
    const {
      queryStringParameters: {
        startDate,
        endDate,
        timezone,
        groupByColumn = null,
        groupByValue = null,
      },
      multiValueQueryStringParameters: { links = [] },
    } = event;

    if (!startDate) throw apiExceptions.missingStartDate;
    if (groupByColumn && groupByValue) {
      switch (groupByColumn) {
        case systemConstants.GROUP_BY_COLUMNS.DATE:
          if (!Object.keys(systemConstants.GROUP_BY_VALUES).includes(groupByValue))
            throw apiExceptions.invalidGroupByClause;
          break;

        default:
          throw apiExceptions.invalidGroupByClause;
      }
    }

    const now: Date = new Date();

    let parsedEndDate: Date = null;
    const parsedStartDate: Date = zonedTimeToUtc(
      toDate(parse(startDate, DATE_FORMAT, now), {
        timeZone: timezone,
      }),
      timezone,
    );
    if (endDate) {
      // parse end date and ensure it is after start date
      parsedEndDate = zonedTimeToUtc(
        toDate(parse(endDate, DATE_FORMAT, now), {
          timeZone: timezone,
        }),
        timezone,
      );

      if (parsedStartDate.getTime() > parsedEndDate.getTime())
        throw apiExceptions.startTimeAfterEndTimeError;
    }

    if (!isValid(parsedStartDate)) throw apiExceptions.invalidStartDate;
    if (parsedEndDate && !isValid(parsedEndDate)) throw apiExceptions.invalidEndDate;

    const result = await eventsService.fetchAnalytics({
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      links: links as string[],
      groupByColumn,
      groupByValue,
    });

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const main = middyfyApi(process);
