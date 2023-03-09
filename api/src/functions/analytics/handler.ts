import type { APIGatewayProxyEvent } from "aws-lambda";
import { zonedTimeToUtc, toDate } from "date-fns-tz";
import { parse, isValid } from "date-fns";
import * as Yup from "yup";

import { middyfyApi } from "@libs/lambda";

import schemaValidator from "../../middlewares/validator.middleware";

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

    if (groupByValue && !groupByColumn) throw apiExceptions.missingGroupByColumnClause;

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

export const main = middyfyApi(process).use([
  schemaValidator({
    queryStringParameters: Yup.object({
      startDate: Yup.string().required().trim(),
      timezone: Yup.string().required().trim(),
      endDate: Yup.string().default(null).nullable(),
      groupByColumn: Yup.string()
        .default(null)
        .nullable()
        .oneOf(Object.values(systemConstants.GROUP_BY_COLUMNS)),
      groupByValue: Yup.string()
        .oneOf(Object.values(systemConstants.GROUP_BY_VALUES))
        .when("groupByColumn", {
          is: (val: string) => !!val && systemConstants.GROUP_BY_COLUMNS.DATE === val,
          then: (schema) => schema.required().trim(),
          otherwise: (schema) => schema.default(null).nullable(),
        }),
    })
      .required()
      .noUnknown(true),
    multiValueQueryStringParameters: Yup.object({
      links: Yup.array().of(Yup.string()).optional().default([]),
    }).noUnknown(true),
  }),
]);
