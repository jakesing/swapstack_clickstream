import { parse, isValid } from "date-fns";

import { middyfyApi } from "@libs/lambda";
import { ValidatedAPIGatewayProxyEvent } from "@libs/api-gateway";

import schemaValidator from "../../middlewares/validator.middleware";

import * as apiExceptions from "../../exceptions/api";

import IAnalyticsApis from "../../interfaces/api/IAnalyticsApi";

import * as eventsService from "../../services/event.service";

import * as dbUtils from "../../utils/db.helpers";

import { analyticsBodySchema } from "./schema";

const DATE_FORMAT = "MM/dd/yyyy HH:mm:ss";

// initialise db
dbUtils.fetchDb();

const process = async (event: ValidatedAPIGatewayProxyEvent<IAnalyticsApis>) => {
  try {
    const {
      body: { startDate, endDate, groupByColumn = null, groupByValue = null, links = [] },
    } = event;

    if (groupByValue && !groupByColumn) throw apiExceptions.missingGroupByColumnClause;

    const now: Date = new Date();

    let parsedEndDate: Date = null;
    const parsedStartDate: Date = parse(startDate, DATE_FORMAT, now);
    if (endDate) {
      // parse end date and ensure it is after start date
      parsedEndDate = parse(endDate, DATE_FORMAT, now);

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

export const main = middyfyApi(process).use([
  schemaValidator({
    body: analyticsBodySchema,
  }),
]);
